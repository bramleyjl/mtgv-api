import 'dotenv/config';
import axios from 'axios';
import logger from '../src/lib/logger.js';
import Card from '../src/models/card.js';
import database from '../src/db/database.js';
import { dbConfig } from '../src/config/database.js';

const BATCH_SIZE = 500; // Smaller batches to reduce memory usage
const PROCESS_CHUNK_SIZE = 5000; // Process array in chunks to avoid keeping everything in memory

async function pullBulkData() {
  try {
    if (!dbConfig.url) {
      logger.error('DB_URL is not set in environment variables. Cannot connect to database.');
      process.exit(1);
    }
    logger.info(`Connecting to database: ${dbConfig.url.split('@')[1] || dbConfig.url} (name: ${dbConfig.name})`);

    logger.info('Downloading bulk data from Scryfall...');
    const bulkResponse = await axios.get('https://api.scryfall.com/bulk-data/default_cards');
    if (!bulkResponse.data || !bulkResponse.data.download_uri) {
      throw new Error('Invalid bulk data URI response from Scryfall');
    }

    logger.info('Downloading bulk data file (this may take a few minutes)...');
    // Use responseType: 'json' but process in chunks immediately
    const dataResponse = await axios.get(bulkResponse.data.download_uri, {
      responseType: 'json',
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (!dataResponse.data || !Array.isArray(dataResponse.data)) {
      throw new Error('Invalid card entries data from Scryfall');
    }

    const totalCards = dataResponse.data.length;
    logger.info(`Processing ${totalCards} cards in batches of ${BATCH_SIZE}...`);

    const cardInstance = new Card();
    const collection = await cardInstance.getCollection();

    // Clear collection first
    logger.info('Clearing the card data collection...');
    const deleteResult = await collection.deleteMany({});
    logger.info(`Deleted ${deleteResult.deletedCount} entries.`);

    // Process cards in chunks to minimize memory usage
    const seenIds = new Set(); // Track seen scryfall_ids for deduplication
    let processedCount = 0;
    let insertedCount = 0;
    let batch = [];

    // Process array in chunks to avoid keeping entire array in memory
    for (let chunkStart = 0; chunkStart < dataResponse.data.length; chunkStart += PROCESS_CHUNK_SIZE) {
      const chunkEnd = Math.min(chunkStart + PROCESS_CHUNK_SIZE, dataResponse.data.length);
      const chunk = dataResponse.data.slice(chunkStart, chunkEnd);

      logger.info(`Processing chunk ${Math.floor(chunkStart / PROCESS_CHUNK_SIZE) + 1}/${Math.ceil(dataResponse.data.length / PROCESS_CHUNK_SIZE)} (cards ${chunkStart}-${chunkEnd})...`);

      // Process each card in the chunk
      for (const entry of chunk) {
        const parsedCard = cardInstance.serialize_for_db(entry);

        if (parsedCard && !seenIds.has(parsedCard.scryfall_id)) {
          seenIds.add(parsedCard.scryfall_id);
          batch.push(parsedCard);
        }

        // Insert batch when it reaches BATCH_SIZE
        if (batch.length >= BATCH_SIZE) {
          try {
            await collection.insertMany(batch, { ordered: false });
            insertedCount += batch.length;
            processedCount += batch.length;
            batch = []; // Clear batch to free memory
          } catch (insertError) {
            // Handle duplicate key errors (shouldn't happen with deduplication, but be safe)
            if (insertError.code === 11000) {
              logger.warn(`Skipped ${batch.length} duplicate entries in batch`);
            } else {
              throw insertError;
            }
            batch = [];
          }
        }
      }

      // Clear chunk from memory (let GC handle it)
      dataResponse.data[chunkStart] = null;
    }

    // Insert remaining batch
    if (batch.length > 0) {
      try {
        await collection.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        processedCount += batch.length;
      } catch (insertError) {
        if (insertError.code === 11000) {
          logger.warn(`Skipped ${batch.length} duplicate entries in final batch`);
        } else {
          throw insertError;
        }
      }
    }

    logger.info(`Bulk data update complete. Processed ${processedCount} cards, inserted ${insertedCount} unique entries.`);

    // Clear references to help GC
    dataResponse.data = null;
    batch = null;
    seenIds.clear();

    await database.close();
    process.exit(0);
  } catch (err) {
    logger.error('Error during pullBulkData:', err);
    try {
      await database.close();
    } catch {
      // Ignore close errors
    }
    process.exit(1);
  }
}

pullBulkData();
