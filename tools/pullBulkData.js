import 'dotenv/config';
import axios from 'axios';
import logger from '../src/lib/logger.js';
import Card from '../src/models/card.js';

async function pullBulkData() {
  try {
    logger.info('Downloading bulk data from Scryfall...');
    const bulkResponse = await axios.get('https://api.scryfall.com/bulk-data/default_cards');    
    if (!bulkResponse.data || !bulkResponse.data.download_uri) {
      throw new Error('Invalid bulk data URI response from Scryfall');
    }

    const dataResponse = await axios.get(bulkResponse.data.download_uri);    
    if (!dataResponse.data || !Array.isArray(dataResponse.data)) {
      throw new Error('Invalid card entries data from Scryfall');
    }
    
    logger.info('Parsing bulk card data...');
    const cardInstance = new Card();
    const parsedCards = dataResponse.data
      .map(entry => cardInstance.serialize_for_db(entry))
      .filter(Boolean);

    logger.info('Writing card data to the database...');
    await cardInstance.writeCollection(parsedCards);
    logger.info('Bulk data update complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during pullBulkData:', err);
    throw err;
  }
}

pullBulkData();
