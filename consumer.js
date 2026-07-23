const amqp = require("amqplib");

const QUEUE_NAME = "govuk_hmt_urls";

async function main() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(1);

  console.log("waiting for URLs. Press CTRL+C to stop.");

  channel.consume(QUEUE_NAME, (msg) => {
    const url = msg.content.toString();
    console.log("processing:", url);
    channel.ack(msg);
  });
}

main().catch(console.error);