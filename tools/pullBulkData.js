require("dotenv").config();

const axios = require('axios');
const mongo = require("../helpers/mongo");

function pullBulkData() {
  return axios.get('https://api.scryfall.com/bulk-data/default_cards')
  .then(response => {
    console.log('Downloading bulk data...')
    return axios.get(response.data.download_uri);
  })
  .then(cards => { mongo.updateCardData(cards.data) })
  .catch(err => { console.log(err); });
}

pullBulkData();
