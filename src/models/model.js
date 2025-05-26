import { DatabaseError, NotFoundError } from "../lib/errors.js";
import { ObjectId } from "mongodb";
import logger from "../lib/logger.js";
import database from "../db/database.js";

class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async getCollection() {
    try {
      return database.getCollection(this.collectionName);
    } catch (error) {
      throw new DatabaseError('getCollection', error.message);
    }
  }

  async create(data) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne(data);
      return result['insertedId'] ? result.insertedId : null;
    } catch (error) {
      logger.error(`Error creating document in ${this.collectionName}:`, error);
      throw new DatabaseError('create', error.message);
    }
  }

  async find(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne({ _id: new ObjectId(id) });
      if (!result) { throw new NotFoundError(this.collectionName, id) }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) { throw error }
      logger.error(`Error finding document by ID in ${this.collectionName}:`, error);
      throw new DatabaseError('find', error.message);
    }
  }

  async find_by(query) {
    try {
      const collection = await this.getCollection();
      const sortCriteria = query.sort;
      const filter = Object.assign({}, query);
      delete filter.sort;
      const result = await collection.find(filter).sort(sortCriteria).toArray();
      if (!result) { throw new NotFoundError(this.collectionName, query.sanitized_name) }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) { throw error }
      logger.error(`Error finding documents by query in ${this.collectionName}:`, error);
      throw new DatabaseError('find_by', error.message);
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
