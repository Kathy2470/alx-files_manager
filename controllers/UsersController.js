// import pkg from 'mongodb';
// const { ObjectId } = pkg;
// import sha1 from 'sha1';
// import Queue from 'bull';
// import dbClient from '../utils/db';
// import userUtils from '../utils/user'; // Import your utility file for getting user by ID

// const userQueue = new Queue('userQueue');

// class UsersController {
//   static async postNew(req, res) {
//     const { email, password } = req.body;

//     // Validate email and password
//     if (!email) {
//       return res.status(400).json({ error: 'Missing email' });
//     }

//     if (!password) {
//       return res.status(400).json({ error: 'Missing password' });
//     }

//     // Check if the user already exists
//     const emailExists = await dbClient.db.collection('users').findOne({ email });
//     if (emailExists) {
//       return res.status(400).json({ error: 'Already exist' });
//     }

//     // Hash the password with SHA1
//     const sha1Password = sha1(password);

//     try {
//       // Insert the new user into the database
//       const result = await dbClient.db.collection('users').insertOne({
//         email,
//         password: sha1Password,
//       });

//       const user = {
//         id: result.insertedId.toString(),
//         email,
//       };

//       // Add user to the queue (optional, based on your setup)
//       await userQueue.add({
//         userId: user.id,
//       });

//       // Return the created user
//       return res.status(201).json(user);
//     } catch (err) {
//       return res.status(500).json({ error: 'Error creating user' });
//     }
//   }

//   static async getMe(req, res) {
//     try {
//       // Assuming you have a utility function to extract token from headers
//       const { token } = req.headers;
      
//       if (!token) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }

//       // Fetch the user ID from Redis based on the token
//       const userId = await redisClient.get(`auth_${token}`);
      
//       if (!userId) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }

//       // Fetch the user from the database
//       const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      
//       if (!user) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }

//       // Return the user details
//       const processedUser = { id: user._id.toString(), email: user.email };
//       return res.status(200).json(processedUser);
//     } catch (err) {
//       return res.status(500).json({ error: 'Error retrieving user' });
//     }
//   }
// }

// export default UsersController;




import pkg from 'mongodb';
const { ObjectId } = pkg;
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js'; // Import Redis client

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
    const emailExists = await dbClient.db.collection('users').findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password with SHA1
    const sha1Password = sha1(password);

    try {
      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: sha1Password,
      });

      const user = {
        id: result.insertedId.toString(),
        email,
      };

      // Add user to the queue (optional)
      await userQueue.add({
        userId: user.id,
      });

      // Return the created user
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }

  static async getMe(req, res) {
    try {
      // Retrieve token from headers
      const token = req.header('X-Token');
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch the user ID from Redis based on the token
      const userId = await redisClient.get(`auth_${token}`);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch the user from the database
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user details
      const processedUser = { id: user._id.toString(), email: user.email };
      return res.status(200).json(processedUser);
    } catch (err) {
      return res.status(500).json({ error: 'Error retrieving user' });
    }
  }
}

export default UsersController;
