import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
  /**
   * Signs in the user by generating a new authentication token.
   *
   * This method uses the Authorization header with Basic authentication
   * (Base64-encoded <email>:<password>) to find a user with the given
   * email and password (passwords are stored as SHA1 hashes).
   *
   * If the credentials are incorrect or the user is not found,
   * it responds with an Unauthorized error (status code 401).
   *
   * If the user is found:
   * - A new token is generated using uuidv4().
   * - The token is used to create a key `auth_<token>`.
   * - This key is stored in Redis with the user's ID, set to expire in 24 hours.
   * - The token is returned in the response with a status code 200.
   *
   * @param {object} request - The express request object.
   * @param {object} response - The express response object.
   * @returns {object} - The response object with the token or error message.
   */
  static async getConnect(request, response) {
    // Extract the Authorization header
    const Authorization = request.header('Authorization') || '';

    // Split the header to get the credentials part
    const credentials = Authorization.split(' ')[1];

    // If no credentials are found, respond with Unauthorized error
    if (!credentials) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Decode the Base64 credentials to get email and password
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    // If email or password is missing, respond with Unauthorized error
    if (!email || !password) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Hash the password with SHA1
    const sha1Password = sha1(password);

    // Fetch the user from the database with the provided email and hashed password
    const user = await userUtils.getUser({ email, password: sha1Password });

    // If the user is not found, respond with Unauthorized error
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Generate a new token and create a Redis key
    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 24;

    // Store the user ID in Redis with the generated key, set to expire in 24 hours
    await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

    // Respond with the token
    return response.status(200).send({ token });
  }

  /**
   * Signs out the user based on the token.
   *
   * This method retrieves the user ID and Redis key from the request
   * using the `getUserIdAndKey` utility method.
   *
   * If the user ID is not found, it responds with an Unauthorized error (status code 401).
   *
   * Otherwise:
   * - The token is deleted from Redis.
   * - The response is sent with no content and status code 204.
   *
   * @param {object} request - The express request object.
   * @param {object} response - The express response object.
   * @returns {object} - The response object with no content.
   */
  static async getDisconnect(request, response) {
    // Get the user ID and Redis key from the request
    const { userId, key } = await userUtils.getUserIdAndKey(request);

    // If user ID is not found, respond with Unauthorized error
    if (!userId) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.del(key);

    // Respond with no content
    return response.status(204).send();
  }
}

export default AuthController;
