import redis from 'redis';

const redisClient = redis.createClient({
  url: 'redis://localhost:6379', // Adjust as needed
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
