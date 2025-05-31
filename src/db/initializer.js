import database from "./database.js";
import logger from "../lib/logger.js";

export async function initializeDatabase() {
  try {
    await database.connect();
    logger.info('Database connected successfully');
    
    await createIndexes();
    logger.info('Database indexes created successfully');
    
    return true;
  } catch (err) {
    logger.error('Database initialization failed:', err);
    throw err;
  }
}

async function createIndexes() {
  try {
    logger.info('Creating database indexes...');
    const cardsCollection = await database.getCollection('cards');
    
    await cardsCollection.createIndex({ "sanitized_name": 1 }, 
      { name: "idx_sanitized_name" });
    
    await cardsCollection.createIndex({ "games": 1 }, 
      { name: "idx_games" });
    
    await cardsCollection.createIndex({ "sanitized_name": 1, "games": 1 }, 
      { name: "idx_name_games" });
    
    await cardsCollection.createIndex({ "prices.usd": 1 }, 
      { name: "idx_price_usd" });
    
    await cardsCollection.createIndex({ "prices.tix": 1 }, 
      { name: "idx_price_tix" });
    
    await cardsCollection.createIndex({ "released_at": 1 }, 
      { name: "idx_released_at" });
    
    logger.info('Database indexes created successfully');
    return true;
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
}