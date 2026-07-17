const amqp = require("amqplib");

const QUEUE_NAME = "govuk_hmt_urls";

async function main() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  while (true) {
    const msg = await channel.get(QUEUE_NAME, { noAck: false });

    if (msg === false) {
      console.log("queue is empty, stopping.");
      break;
    }

    const url = msg.content.toString();
    try {
      console.log("processing:", url);
      channel.ack(msg); 
    } catch (err) {
      console.log("failed:", url, err.message);
      channel.nack(msg, false, true); 
    }
  }

  await channel.close();
  await connection.close();
}

main().catch(console.error);