const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('fifo-queue');

  for (let i = 1; i <= 20; i++) {
    const msg = `Message ${i}`;
    channel.sendToQueue('fifo-queue', Buffer.from(msg));
    console.log(` [x] Sent ${msg}`);
  }

  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);