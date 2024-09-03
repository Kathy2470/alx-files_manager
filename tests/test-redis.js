// test-redis.js
import redis from 'redis';

// Create a new Redis client
const client = redis.createClient({
  host: 'localhost', // Replace with your Redis host if different
  port: 6379, // Replace with your Redis port if different
});

// Handle errors
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Handle successful connection
client.on('connect', () => {
  console.log('Connected to Redis');

  // Test the connection by setting and getting a key
  client.set('testKey', 'testValue', (err) => {
    if (err) {
      console.error('Set error:', err);
    } else {
      console.log('Key set successfully');

      client.get('testKey', (err, value) => {
        if (err) {
          console.error('Get error:', err);
        } else {
          console.log('Retrieved value:', value);
        }

        // Clean up and close the connection
        client.quit();
      });
    }
  });
});
