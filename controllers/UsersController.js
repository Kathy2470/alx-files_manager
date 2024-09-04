import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db.js';

const userQueue = new Queue('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists
    const emailExists = await dbClient.usersCollection.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password with SHA1
    const sha1Password = sha1(password);

    try {
      // Insert the new user into the database
      const result = await dbClient.usersCollection.insertOne({
        email,
        password: sha1Password,
      });

      const user = {
        id: result.insertedId.toString(),
        email,
      };

      // Add user to the queue (optional, based on your setup)
      await userQueue.add({
        userId: user.id,
      });

      // Return the created user
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }

  // Method for getting user by token
  static async getMe(req, res) {
    const { userId } = await userUtils.getUserIdAndKey(req);

    const user = await userUtils.getUser({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const processedUser = { id: user._id.toString(), email: user.email };
    return res.status(200).json(processedUser);
  }
}

export default UsersController;
