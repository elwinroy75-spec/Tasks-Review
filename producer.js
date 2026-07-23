const amqp = require("amqplib");
const axios = require("axios");
const cheerio = require("cheerio");

const QUEUE_NAME = "govuk_hmt_urls";
const PAGE_URL = "https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest";

async function main() {
  const { data } = await axios.get(PAGE_URL);
  const $ = cheerio.load(data);

  const urls = $("a.gem-c-document-list__item-title")
    .map((i, el) => "https://www.gov.uk" + $(el).attr("href"));
    //.get();

  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  urls.forEach((url) => {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(url), { persistent: true });
    console.log("queued:", url);
  });

  console.log(`${urls.length} URLs queued.`);
  await channel.close();
  await connection.close();
}

main().catch(console.error);