const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function main() {
  await client.connect();
  console.log('Connected to Redis!');

  // CREATE - push items to a list
  // rPush adds to the END of the list
  await client.rPush('fruits', ['Apple', 'Banana', 'Mango']);
  console.log('Pushed 3 fruits to the right (end) of list');

  // lPush adds to the START of the list
  await client.lPush('fruits', 'Orange');
  console.log('Pushed Orange to the left (start) of list');

  // READ - get all items in the list
  // 0 to -1 means "from first to last element"
  let allFruits = await client.lRange('fruits', 0, -1);
  console.log('All fruits:', allFruits);

  // READ - get list length
  const length = await client.lLen('fruits');
  console.log('Number of fruits:', length);

  // READ - get a single item by index (0-based)
  const firstFruit = await client.lIndex('fruits', 0);
  console.log('First fruit:', firstFruit);

  // UPDATE - replace item at a specific index
  await client.lSet('fruits', 1, 'Grapes');
  console.log('Updated index 1 to Grapes');
  allFruits = await client.lRange('fruits', 0, -1);
  console.log('After update:', allFruits);

  // DELETE - remove from the LEFT (start) of the list
  const removedLeft = await client.lPop('fruits');
  console.log('Removed from left:', removedLeft);

  // DELETE - remove from the RIGHT (end) of the list
  const removedRight = await client.rPop('fruits');
  console.log('Removed from right:', removedRight);

  // DELETE - remove specific value(s) from the list
  // 0 means remove ALL occurrences of that value
  await client.lRem('fruits', 0, 'Grapes');
  console.log('Removed all occurrences of Grapes');

  // Final state
  allFruits = await client.lRange('fruits', 0, -1);
  console.log('Final list:', allFruits);

  await client.quit();
}

main();