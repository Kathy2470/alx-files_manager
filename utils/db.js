// utils/db.js
import pkg from 'mongodb'; // Import the entire module
const { MongoClient } = pkg; // Destructure the named export

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '27017';
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
      });
  }

  // Method to check if the MongoDB client is connected
  isAlive() {
    // Use `this.client.topology.isConnected()` for older versions of MongoDB
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  // Method to get the number of users in the 'users' collection
  async nbUsers() {
    if (!this.db) return 0; // Ensure `this.db` is initialized
    return this.db.collection('users').countDocuments();
  }

  // Method to get the number of files in the 'files' collection
  async nbFiles() {
    if (!this.db) return 0; // Ensure `this.db` is initialized
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
