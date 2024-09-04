// import redis from 'redis';

// const redisClient = redis.createClient({
//   url: 'redis://localhost:6379', // Adjust as needed
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error:', err);
// });

// export default redisClient;



import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.error('Redis client not connected to the server:', err));
  }

  isAlive() {
    return this.client.connected;
  }

  // Add other methods as needed, e.g., for getting or setting values
}

const redisClient = new RedisClient();
export default redisClient;
