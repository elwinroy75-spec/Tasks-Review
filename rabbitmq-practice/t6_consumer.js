const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('durable-queue', { durable: true });

  console.log(' [*] Waiting for messages. To exit press CTRL+C');
  channel.consume('durable-queue', (msg) => {
    if (msg !== null) {
      console.log(` [x] Received ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);