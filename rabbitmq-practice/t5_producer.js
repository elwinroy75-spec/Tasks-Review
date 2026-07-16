const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('work-queue');

  for (let i = 1; i <= 30; i++) {
    channel.sendToQueue('work-queue', Buffer.from(`Task ${i}`));
  }

  console.log(' [x] Sent 30 messages');
  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);