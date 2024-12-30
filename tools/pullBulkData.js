require("dotenv").config();

const axios = require('axios');
const Card = require('../src/models/card');

async function pullBulkData() {
  try {
    console.log('Downloading bulk data...');
    const response = await axios.get('https://api.scryfall.com/bulk-data/default_cards');
    const cardEntries = await axios.get(response.data.download_uri);

    const card = new Card();
    const parsedCards = cardEntries.data.map(entry => card.serialize(entry)).filter(Boolean); 

    await card.writeCollection(parsedCards);
  } catch (err) {
    console.log(err);
  }
}

pullBulkData();
