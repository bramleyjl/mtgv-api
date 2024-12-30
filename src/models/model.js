const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.DB_URL, { 
  serverApi: { 
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});
let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      db = client.db(process.env.DB_NAME);
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }
  return db;
}

class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async create(data) {
    const collection = await this.getCollection();
    const result = await collection.insertOne(data);
    return result['insertedId'] ? result.insertedId : null;
  }

  // async find(id) {
  //   const collection = await this.getCollection();
  //   return collection.findOne({ _id: new ObjectId(id) });
  // }

  // async update(id, updateData) {
  //   const collection = await this.getCollection();
  //   const result = await collection.updateOne(
  //     { _id: new ObjectId(id) },
  //     { $set: updateData }
  //   );
  //   return result.matchedCount > 0;
  // }

  // async delete(id) {
  //   const collection = await this.getCollection();
  //   const result = await collection.deleteOne({ _id: new ObjectId(id) });
  //   return result.deletedCount > 0;
  // }

  async getCollection() {
    const database = await connectDB();
    return database.collection(this.collectionName);
  }

  async find_by(key, value) {
    const collection = await this.getCollection();
    return collection.find({ [key]: value }).toArray();
  }

  static async closeConnection() {
    try {
      console.log('Closing MongoDB connection...');
      await client.close();
      db = null;
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

module.exports = Model;
