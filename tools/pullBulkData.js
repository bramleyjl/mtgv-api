import 'dotenv/config';
import axios from 'axios';
import streamChain from 'stream-chain';
import streamJson from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import logger from '../src/lib/logger.js';
import Card from '../src/models/card.js';
import database from '../src/db/database.js';
import { dbConfig } from '../src/config/database.js';

const { chain } = streamChain;
const { parser } = streamJson;

const BATCH_SIZE = 200; // Reduced from 300 for even lower memory footprint

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

    const cardInstance = new Card();
    const collection = await cardInstance.getCollection();

    // Clear collection first
    logger.info('Clearing the card data collection...');
    const deleteResult = await collection.deleteMany({});
    logger.info(`Deleted ${deleteResult.deletedCount} entries.`);

    logger.info('Streaming bulk data file from Scryfall (this may take a few minutes)...');

    // Stream the download instead of loading into memory
    const response = await axios.get(bulkResponse.data.download_uri, {
      responseType: 'stream',
      timeout: 300000, // 5 minute timeout for download
    });

    let processedCount = 0;
    let batch = [];
    let lastLogTime = Date.now();

    // Process the stream
    await new Promise((resolve, reject) => {
      const pipeline = chain([
        response.data,
        parser(),
        new StreamArray()
      ]);

      pipeline
        .on('data', async ({ value: entry }) => {
          try {
            const parsedCard = cardInstance.serialize_for_db(entry);

            if (parsedCard) {
              batch.push(parsedCard);
              processedCount++;

              // Log progress every 5000 cards
              if (processedCount % 5000 === 0) {
                const now = Date.now();
                if (now - lastLogTime > 10000) { // Log at most every 10 seconds
                  logger.info(`Processed ${processedCount} cards so far...`);
                  lastLogTime = now;
                }
              }

              // Insert batch when it reaches BATCH_SIZE
              if (batch.length >= BATCH_SIZE) {
                // Pause stream while inserting
                pipeline.pause();

                try {
                  // Use bulkWrite with replaceOne to handle duplicates via unique index
                  const operations = batch.map(card => ({
                    replaceOne: {
                      filter: { scryfall_id: card.scryfall_id },
                      replacement: card,
                      upsert: true
                    }
                  }));
                  
                  await collection.bulkWrite(operations, { ordered: false });
                  batch = []; // Clear batch to free memory

                  // Force garbage collection hint if available
                  if (global.gc) {
                    global.gc();
                  }
                } catch (insertError) {
                  logger.error(`Error in bulkWrite: ${insertError.message}`);
                  batch = [];
                }

                // Resume stream
                pipeline.resume();
              }
            }
          } catch (error) {
            reject(error);
          }
        })
        .on('end', async () => {
          // Insert remaining batch
          if (batch.length > 0) {
            try {
              const operations = batch.map(card => ({
                replaceOne: {
                  filter: { scryfall_id: card.scryfall_id },
                  replacement: card,
                  upsert: true
                }
              }));
              
              await collection.bulkWrite(operations, { ordered: false });
            } catch (insertError) {
              logger.error(`Error in final bulkWrite: ${insertError.message}`);
            }
          }
          resolve();
        })
        .on('error', reject);
    });

    logger.info(`Bulk data update complete. Processed ${processedCount} cards total.`);

    // Clear references to help GC
    batch = null;

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
