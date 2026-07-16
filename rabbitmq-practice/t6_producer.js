const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('durable-queue', { durable: true });

  channel.sendToQueue(
    'durable-queue',
    Buffer.from('This message should survive a restart'),
    { persistent: true }
  );

  console.log(' [x] Sent persistent message');
  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);