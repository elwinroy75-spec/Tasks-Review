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

  // CREATE multiple keys one by one
  await client.set('name', 'John Doe');
  await client.set('city', 'Bangalore');
  await client.set('country', 'India');
  console.log('Created 3 keys: name, city, country');

  // CREATE multiple keys in one shot using mSet
  await client.mSet({
    fruit: 'Mango',
    color: 'Blue',
    animal: 'Tiger'
  });
  console.log('Created 3 more keys using mSet: fruit, color, animal');

  // READ one key
  const name = await client.get('name');
  console.log('Get name:', name);

  // READ multiple keys at once using mGet
  const values = await client.mGet(['city', 'country', 'fruit']);
  console.log('Get multiple (city, country, fruit):', values);

  // UPDATE a key (just overwrite it)
  await client.set('city', 'Mumbai');
  console.log('Updated city:', await client.get('city'));

//   // DELETE a single key
//   await client.del('color');
//   console.log('Deleted color. Now:', await client.get('color')); // null

//   // DELETE multiple keys at once
//   await client.del(['fruit', 'animal']);
//   console.log('Deleted fruit and animal');

  // Check what's left
  const allKeys = await client.keys('*');
  console.log('All remaining keys:', allKeys);

  await client.quit();
}

main();