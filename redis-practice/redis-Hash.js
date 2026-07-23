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

  // CREATE - set a single field in a hash
  await client.hSet('user:1', 'name', 'Alice');
  console.log('Set name field on user:1');

  // CREATE - set multiple fields at once
  await client.hSet('user:1', {
    age: '25',
    city: 'Bangalore',
    email: 'alice@example.com'
  });
  console.log('Set multiple fields on user:1');

  // READ - get a single field
  const name = await client.hGet('user:1', 'name');
  console.log('Name field:', name);

  // READ - get ALL fields and values
  const allData = await client.hGetAll('user:1');
  console.log('All user:1 data:', allData);

  // READ - get multiple specific fields
  const someFields = await client.hmGet('user:1', ['name', 'city']);
  console.log('Name and city:', someFields);

  // READ - check if a field exists
  const hasEmail = await client.hExists('user:1', 'email');
  console.log('Has email field:', hasEmail); // true or 1

  // READ - get all field names only
  const fieldNames = await client.hKeys('user:1');
  console.log('Field names:', fieldNames);

  // READ - get all values only
  const values = await client.hVals('user:1');
  console.log('Field values:', values);

  // READ - count number of fields
  const fieldCount = await client.hLen('user:1');
  console.log('Number of fields:', fieldCount);

  // UPDATE - just overwrite the field (same command as create)
  await client.hSet('user:1', 'city', 'Mumbai');
  console.log('Updated city:', await client.hGet('user:1', 'city'));

  // Numeric increment on a hash field
  await client.hIncrBy('user:1', 'age', 1);
  console.log('Age after increment:', await client.hGet('user:1', 'age'));

//   // DELETE - remove a single field
//   await client.hDel('user:1', 'email');
//   console.log('Deleted email field');

//   // DELETE - remove multiple fields at once
//   await client.hDel('user:1', ['age', 'city']);
//   console.log('Deleted age and city fields');

  // Final state
  const finalData = await client.hGetAll('user:1');
  console.log('Final user:1 data:', finalData);

  await client.quit();
}

main();