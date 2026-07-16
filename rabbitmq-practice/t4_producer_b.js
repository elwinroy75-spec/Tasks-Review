const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('multi-producer-queue');

  for (let i = 1; i <= 50; i++) {
    channel.sendToQueue('multi-producer-queue', Buffer.from(`B-Message ${i}`));
  }

  console.log(' [x] Producer B sent 50 messages');
  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);