import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        console.error('DB connection error:', err);
      } else {
        console.log('Connected to MongoDB');
      }
    });
  }

  async isEmailExists(email) {
    if (!this.client || !this.client.isConnected()) {
      throw new Error('DB connection is not established');
    }
    const db = this.client.db();
    const collection = db.collection('users');
    const user = await collection.findOne({ email });
    return user !== null;
  }

  async insertUser(user) {
    if (!this.client || !this.client.isConnected()) {
      throw new Error('DB connection is not established');
    }
    const db = this.client.db();
    const collection = db.collection('users');
    return collection.insertOne(user);
  }

  async getUserByEmailAndPassword(email, password) {
    try {
      if (!this.client || !this.client.isConnected()) {
        throw new Error('DB connection is not established');
      }
      const db = this.client.db();
      const collection = db.collection('users');
      const user = await collection.findOne({ email, password });
      return user;
    } catch (error) {
      console.error('Error retrieving user by email and password:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
