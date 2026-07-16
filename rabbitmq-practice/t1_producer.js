const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('hello-queue');

  channel.sendToQueue('hello-queue', Buffer.from('Hello RabbitMQ'));
  console.log(" [x] Sent 'Hello RabbitMQ'");

  setTimeout(() => connection.close(), 500);
}

main().catch(console.error);