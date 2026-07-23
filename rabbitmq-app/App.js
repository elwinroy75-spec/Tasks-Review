const amqp = require("amqplib");
const axios = require("axios");
const cheerio = require("cheerio");

const QUEUE_NAME = "govuk_hmt_urls";
const PAGE_URL =
  "https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest";
const PRODUCE_TIME = 10000; 
const RECONNECT = 5000;

let channel = null;
const queuedUrls = new Set(); 

async function init() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    connection.on("close", () => {
      console.error("[rabbitmq] connection closed - reconnecting...");
      channel = null;
      setTimeout(init, RECONNECT);
    });

    connection.on("error", (err) => {
      console.error("[rabbitmq] connection error:", err.message);
    });

    console.log("[rabbitmq] connected, queue ready:", QUEUE_NAME);
  } catch (err) {
    console.error("[rabbitmq] connect failed:", err.message, `- retrying in ${RECONNECT / 1000}s`);
    setTimeout(init, RECONNECT);
  }
}

async function produceMessages(url) {
  if (!channel) {
    console.error("[producer] no channel, will retry in 5s:", url);
    setTimeout(() => produceMessages(url), 5000);
    return;
  }
  try {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(url), { persistent: true });
    console.log("[producer] queued:", url);
  } catch (err) {
    console.error("[producer] failed to queue, will retry in 5s:", url, err.message);
    setTimeout(() => produceMessages(url), 5000);
  }
}

async function consumeMessages() {
  try {
    const msg = await channel.get(QUEUE_NAME, { noAck: false });
    if (!msg) return;

    const url = msg.content.toString();

    try {
      if (url === PAGE_URL) {
        console.log("[consumer] expanding main page URL:", url);
        await expand(url);
      } else {
        console.log("[consumer] processing:", url);
      }
      channel.ack(msg);
    } catch (err) {
      console.error("[consumer] failed:", url, err.message);
      channel.nack(msg, false, false);
    }
  } catch (err) {
    console.error("[consumer] get failed:", err.message);
  }
}

async function expand(pageUrl) {
  const { data } = await axios.get(pageUrl);
  const $ = cheerio.load(data);

  const newUrls = $("#js-results a[href^='/government/']")
    .toArray()
    .map((el) => "https://www.gov.uk" + $(el).attr("href"))
    .filter((url) => !queuedUrls.has(url));

  console.log(`[consumer] found ${newUrls.length} new URLs`);

  newUrls.forEach((url, i) => {
    queuedUrls.add(url);
    setTimeout(() => produceMessages(url), i * PRODUCE_TIME);
  });
}

module.exports = { init, consumeMessages, produceMessages, PAGE_URL };