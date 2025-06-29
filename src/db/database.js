import { DatabaseError } from '../lib/errors.js';
import { MongoClient, ServerApiVersion } from "mongodb";
import logger from "../lib/logger.js";
import { dbConfig } from '../config/database.js';

class Database {
  constructor() {
    console.log('Database constructor called');
    console.log('Database URL:', dbConfig.url);
    console.log('Database Name:', dbConfig.name);
    
    this.client = new MongoClient(dbConfig.url, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      this.db = null;
      this.connected = false;
    }

  async connect() {
    if (!this.connected) {
      try {
        await this.client.connect();
        this.db = this.client.db(dbConfig.name);
        this.connected = true;
        logger.info('Connected to MongoDB');
      } catch (error) {
        logger.error('MongoDB connection failed:', error);
        throw new DatabaseError('connect', error.message);
      }
    }
    return this.db;
  }

  async getCollection(collectionName) {
    try {
      const db = await this.connect();
      return db.collection(collectionName);
    } catch (error) {
      logger.error('Error fetching MongoDB collection:', error);
      throw new DatabaseError('getCollection', error.message);
    }
  }

  async close() {
    if (this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        this.db = null;
        this.client = null;
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