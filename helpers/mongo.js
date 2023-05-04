const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.DB_URL,
                               { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function updateCardData(cards) {
  try {
    await client.connect();
    console.log('Connected to database...');
    const collection = client.db(process.env.DB_NAME).collection(process.env.BULK_DATA_COLLECTION);
    await collection.deleteMany( {} )
    .then(res => {
      console.log('Database cleared: ' + res.deletedCount + ' entries deleted');
      return collection.insertMany(cards)
      .then(res => {
        console.log('Database updated: ' + res.insertedCount + ' entries added');
      })
    })
  } finally {
    await client.close();
  }
}

module.exports.updateCardData = updateCardData;
