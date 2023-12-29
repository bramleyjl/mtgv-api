require("dotenv").config();

const axios = require('axios');
const mongo = require('../helpers/mongo');
const helper = require('../helpers/helper');

function pullBulkData() {
  return axios.get('https://api.scryfall.com/bulk-data/default_cards')
  .then(response => {
    console.log('Downloading bulk data...')
    return axios.get(response.data.download_uri);
  })
  .then(cards => {
    const parsedData = cards.data.map(card => {
      return {
        scryfall_id: card.id,
        tcgplayer_id: card.tcgplayer_id,
        name: card.name,
        sanitized_name: helper.sanitizeCardName(card.name),
        games: card.games,
        set: card.set,
        set_name: card.set_name,
        collector_number: card.collector_number,
        image_uris: card.card_faces != null ? [card.card_faces[0].image_uris, card.card_faces[1].image_uris] : [card.image_uris],
        released_at: card.released_at,
        prices: card.prices,
        card_faces: card.card_faces,
        border_color: card.border_color
      }
    })
    mongo.updateCardData(parsedData)
  })
  .catch(err => { console.log(err); });
}

pullBulkData();
