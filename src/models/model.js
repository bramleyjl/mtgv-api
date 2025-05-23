import { ObjectId } from "mongodb";
import logger from "../lib/logger.js";
import database from "../db/database.js";

class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async getCollection() {
    return database.getCollection(this.collectionName);
  }

  async create(data) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne(data);
      return result['insertedId'] ? result.insertedId : null;
    } catch (error) {
      logger.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async find(id) {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      logger.error(`Error finding document by ID in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async find_by(query) {
    try {
      const collection = await this.getCollection();
      return collection.find(query).toArray();
    } catch (error) {
      logger.error(`Error finding documents by query in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findAny() {
    try {
      const collection = await this.getCollection();
      return collection.findOne();
    } catch (error) {
      logger.error(`Error finding any document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return result.matchedCount > 0;
    } catch (error) {
      logger.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting document in ${this.collectionName}:`, error);
      throw error;
    }
  }
}

export default Model;
