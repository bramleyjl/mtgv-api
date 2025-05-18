import { MongoClient, ServerApiVersion } from "mongodb";
import logger from "../lib/logger.js";

class Database {
  constructor() {
    this.client = new MongoClient(process.env.DB_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
    this.db = null;
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      try {
        await this.client.connect();
        this.db = this.client.db(process.env.DB_NAME);
        this.connected = true;
        logger.info('Connected to MongoDB');
      } catch (error) {
        logger.error('MongoDB connection failed:', error);
        throw error;
      }
    }
    return this.db;
  }

  async getCollection(collectionName) {
    const db = await this.connect();
    return db.collection(collectionName);
  }

  async close() {
    if (this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        this.db = null;
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        throw error;
      }
    }
  }
}

const database = new Database();
export default database;