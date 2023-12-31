const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.DB_URL,
  { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function getCardDoc(objectKey, objectValue) {
  return client.connect()
  .then(dbo => {
    const bulkData = client.db(process.env.DB_NAME).collection(process.env.BULK_DATA_COLLECTION);
    return bulkData.findOne({ [objectKey]: objectValue })
    .then(docs => {
      dbo.close();
      return docs;
    });
  });
}

async function getCardVersions(objectKey, objectValue) {
  return client.connect()
    .then(dbo => {
      const bulkData = client.db(process.env.DB_NAME).collection(process.env.BULK_DATA_COLLECTION);
      return bulkData.find({ [objectKey]: objectValue }).toArray()
        .then(docs => {
          dbo.close();
          return docs;
        })
    });
}

async function getRandomCards(cardListCount) {
  const basicLands = ["Mountain", "Island", "Plains", "Swamp", "Forest"];
  try {
    const db = client.db(process.env.DB_NAME);
    const bulkData = db.collection(process.env.BULK_DATA_COLLECTION);
    const pipeline = [{ $match: { name: { $not: { $in: basicLands } } } },
                      { $sample: { size: cardListCount } }];  
    var randomCards = [];
    for await (const doc of bulkData.aggregate(pipeline)) { randomCards.push({ name: doc.name, count: 1 }) };
    return randomCards
  } finally {
    await client.close();
  }
}

async function updateCardData(cards) {
  try {
    await client.connect();
    console.log('Connected to database...');
    const collection = client.db(process.env.DB_NAME).collection(process.env.BULK_DATA_COLLECTION);
    await collection.deleteMany({})
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

async function getTCGToken() {
  return client.connect()
    .then(dbo => {
      return dbo.db().collection(process.env.TCG_COLLECTION).find().toArray();
    })
}

async function saveTCGToken(token, expires) {
  return client.connect()
    .then(dbo => {
      return dbo.db(process.env.DB_NAME).collection(process.env.TCG_COLLECTION).updateOne(
        {},
        { $set: { token: token, date: expires } },
        { upsert: true },
      )
        .then(docs => {
          dbo.close()
        })
    });
}

module.exports = { getCardDoc, getCardVersions, getRandomCards, updateCardData, getTCGToken, saveTCGToken }
