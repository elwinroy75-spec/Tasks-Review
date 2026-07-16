const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('purge-queue');

  for (let i = 1; i <= 100; i++) {
    channel.sendToQueue('purge-queue', Buffer.from(`Message ${i}`));
  }

  console.log(' [x] Sent 100 messages');
  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);