const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('monitor-queue');

  console.log(' [*] Waiting for messages. To exit press CTRL+C');
  channel.consume('monitor-queue', (msg) => {
    if (msg !== null) {
      console.log(` [x] Received ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);