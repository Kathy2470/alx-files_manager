import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.get = promisify(this.client.get).bind(this);
    this.set = promisify(this.client.set).bind(this);
    this.del = promisify(this.client.del).bind(this);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.get(key);
  }

  async set(key, value, duration) {
    return this.set(key, value, 'EX', duration);
  }

  async del(key) {
    return this.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
