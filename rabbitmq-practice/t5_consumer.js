const amqp = require('amqplib');

const workerName = process.argv[2] || 'worker';

async function main() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('work-queue');

  console.log(` [*] ${workerName} waiting for messages. To exit press CTRL+C`);
  channel.consume('work-queue', (msg) => {
    if (msg !== null) {
      console.log(` [${workerName}] Received ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);