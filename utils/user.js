import redisClient from './redis.js';
import dbClient from './db.js';

/**
 * Module with user utilities
 */
const userUtils = {
  /**
   * Retrieves user ID and Redis key from request.
   *
   * @param {object} request - The express request object.
   * @returns {object} - An object containing `userId` and `key`.
   *    - `userId`: The ID of the user if the token is valid, otherwise null.
   *    - `key`: The Redis key for the token if present, otherwise null.
   */
  async getUserIdAndKey(request) {
    const obj = { userId: null, key: null };

    // Retrieve the token from the request header
    const xToken = request.header('X-Token');

    // If no token is provided, return the object with null values
    if (!xToken) return obj;

    // Construct the Redis key based on the token
    obj.key = `auth_${xToken}`;

    // Get the user ID from Redis using the constructed key
    obj.userId = await redisClient.get(obj.key);

    return obj;
  },

  /**
   * Retrieves a user document from the database based on the query.
   *
   * @param {object} query - The query object to find the user in the database.
   * @returns {object} - The user document object from the database.
   */
  async getUser(query) {
    const user = await dbClient.usersCollection.findOne(query);
    return user;
  },
};

export default userUtils;
