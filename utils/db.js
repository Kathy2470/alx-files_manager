// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.databaseName = database;
    this.db = null;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(this.databaseName);
        console.log(`Connected to MongoDB at ${url}`);
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  async isAlive() {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (err) {
      console.error('Ping error:', err);
      return false;
    }
  }

  async nbUsers() {
    try {
      if (!this.db) return 0;
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Error fetching number of users:', err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      if (!this.db) return 0;
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error fetching number of files:', err);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
