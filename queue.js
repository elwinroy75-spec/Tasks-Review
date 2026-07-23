const amqp = require("amqplib");
const axios = require("axios");
const cheerio = require("cheerio");

const QUEUE_NAME = "govuk_hmt_urls";
const PAGE_URL =
  "https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest";
const PRODUCER_INTERVAL = 10000;
const CONSUMER_INTERVAL = 2000;
const RECONNECT_DELAY = 5000;

let channel = null;
const queuedUrls = new Set();

async function startWorkers() {
  await connect();
  setInterval(consumeUrls, CONSUMER_INTERVAL);
  console.log(`[consumer] started - checking queue every ${CONSUMER_INTERVAL / 1000}s`);
}

async function connect() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    connection.on("close", () => {
      console.error("[rabbitmq] connection closed - reconnecting...");
      channel = null;
      setTimeout(connect, RECONNECT_DELAY);
    });

    connection.on("error", (err) => console.error("[rabbitmq] error:", err.message));

    console.log("[rabbitmq] connected, queue ready:", QUEUE_NAME);

    if (queuedUrls.size === 0) producer(PAGE_URL); // only expand the page once, on first connect
  } catch (err) {
    console.error("[rabbitmq] connect failed:", err.message, `- retrying in ${RECONNECT_DELAY / 1000}s`);
    setTimeout(connect, RECONNECT_DELAY);
  }
}

function producer(url) {
  if (!channel) return; // no connection right now, skip - message stays unqueued but will be picked up via redelivery for anything already in the queue
  try {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(url), { persistent: true });
    console.log("[producer] queued:", url);
  } catch (err) {
    console.error("[producer] failed to queue:", url, err.message);
  }
}

async function consumeUrls() {
  if (!channel) return;

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
    setTimeout(() => producer(url), i * PRODUCER_INTERVAL);
  });
}

module.exports = { startWorkers };