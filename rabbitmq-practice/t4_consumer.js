const amqp = require('amqplib');

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('multi-producer-queue');

  let count = 0;
  console.log(' [*] Waiting for messages. To exit press CTRL+C');
  channel.consume('multi-producer-queue', (msg) => {
    if (msg !== null) {
      count++;
      console.log(` [x] (${count}) Received ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);