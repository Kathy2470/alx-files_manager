import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AuthController {
  static async getConnect(req, res) {
    // Extract the Authorization header
    const Authorization = req.header('Authorization') || '';

    // Split the header to get the credentials part
    const credentials = Authorization.split(' ')[1];

    if (!credentials) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Decode the Base64 credentials to get email and password
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Hash the password with SHA1
    const sha1Password = sha1(password);

    // Fetch the user from the database
    const user = await dbClient.db.collection('users').findOne({ email, password: sha1Password });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Generate a new token and create a Redis key
    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 24;

    // Store the user ID in Redis with the generated key, set to expire in 24 hours
    await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

    // Respond with the token
    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    // Extract token from headers
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.del(key);

    // Respond with no content
    return res.status(204).send();
  }
}

export default AuthController;
