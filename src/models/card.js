import { DatabaseError } from "../lib/errors.js";
import Model from './model.js';
import logger from "../lib/logger.js";
import { sanitizeCardName } from '../lib/helper.js';
import { Decimal128 } from 'mongodb';
import NodeCache from 'node-cache';

const cardSearchCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 }); // 30 minutes
const cardLookupCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // 1 hour

class Card extends Model {
  static SERIALIZED_FIELDS = {
    scryfall_id: 1,
    oracle_id: 1,
    tcgplayer_id: 1,
    layout: 1,
    name: 1,
    sanitized_name: 1,
    games: 1,
    set: 1,
    set_name: 1,
    collector_number: 1,
    image_uris: 1,
    released_at: 1,
    prices: 1,
    finishes: 1
  };

  constructor() {
    super('cards');
  }

  serialize_for_db(card) {
    if (card.content_warning) { return undefined }

    return {
      scryfall_id: card.id,
      oracle_id: card.oracle_id,
      tcgplayer_id: card.tcgplayer_id,
      cardmarket_id: card.cardmarket_id,
      mtgo_id: card.mtgo_id,
      mtgo_foil_id: card.mtgo_foil_id,
      arena_id: card.arena_id,
      layout: card.layout,
      name: card.name,
      sanitized_name: sanitizeCardName(card.name),
      games: card.games,
      set: card.set.toUpperCase(),
      set_name: card.set_name,
      collector_number: card.collector_number,
      image_uris: card.layout == 'modal_dfc' ? [card.card_faces[0].image_uris, card.card_faces[1].image_uris] : [card.image_uris],
      released_at: card.released_at,
      prices: convertPrices(card.prices),
      border_color: card.border_color,
      finishes: card.finishes
    }
  }

  async find_random(cardListCount, game) {
    try {
      const basicLands = ['Mountain', 'Island', 'Plains', 'Swamp', 'Forest'];
      const collection = await this.getCollection();
      const pipeline = [
        { $match: { name: { $not: { $in: basicLands } }, games: game } },
        { $sample: { size: cardListCount } },
      ];
      const randomCards = [];
      for await (const doc of collection.aggregate(pipeline)) {
        randomCards.push({ name: doc.name, count: 1 });
      }
      return randomCards;
    } catch (error) {
      logger.error('Error finding random cards:', error);
      throw error;
    }
  }

  async find_by(query, projection = Card.SERIALIZED_FIELDS) {
    try {
      // Generate cache key based on query and projection
      const cacheKey = this.generateLookupCacheKey(query, projection);
      
      // Check cache first
      const cached = cardLookupCache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for card lookup: ${cacheKey}`);
        return cached;
      }

      // Perform database query
      const collection = await this.getCollection();
      const cards = await collection.find(query, { projection }).toArray();
      
      // Cache the result
      cardLookupCache.set(cacheKey, cards);
      logger.debug(`Cache miss for card lookup: ${cacheKey}, cached ${cards.length} cards`);
      
      return cards;
    } catch (error) {
      logger.error('Error in find_by:', error);
      throw error;
    }
  }

  // Enhanced searchByName with caching
  async searchByName(query, uniqueNamesOnly = true) {
    try {
      // Generate cache key for search
      const cacheKey = this.generateSearchCacheKey(query, uniqueNamesOnly);
      
      // Check cache first
      const cached = cardSearchCache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for card search: ${cacheKey}`);
        return cached;
      }

      const collection = await this.getCollection();

      const pipeline = [
        { 
          $match: { 
            sanitized_name: new RegExp(query, 'i')
          } 
        },
        { 
          $project: { 
            id: '$scryfall_id',
            name: 1,
            set: 1,
            set_name: 1,
            collector_number: 1,
            oracle_id: 1,
            sanitized_name: 1
          } 
        },
        {
          $addFields: {
            isExactMatch: {
              $eq: [
                { $toLower: '$sanitized_name' },
                query.toLowerCase()
              ]
            }
          }
        }
      ];

      // If uniqueNamesOnly is true, group by oracle_id to get only one version per card
      if (uniqueNamesOnly) {
        pipeline.push(
          {
            $group: {
              _id: '$oracle_id',
              id: { $first: '$id' },
              name: { $first: '$name' },
              set: { $first: '$set' },
              set_name: { $first: '$set_name' },
              collector_number: { $first: '$collector_number' },
              oracle_id: { $first: '$oracle_id' },
              isExactMatch: { $first: '$isExactMatch' }
            }
          },
          {
            $sort: { 
              isExactMatch: -1,  // Exact matches first (true comes before false)
              name: 1 
            } 
          }
        );
      } else {
        // If getting all versions, sort by exact match first, then by name
        pipeline.push(
          {
            $sort: { 
              isExactMatch: -1,  // Exact matches first
              name: 1 
            } 
          }
        );
      }

      const cards = [];
      for await (const doc of collection.aggregate(pipeline)) {
        cards.push({
          id: doc.id,
          name: doc.name,
          set: doc.set,
          set_name: doc.set_name,
          collector_number: doc.collector_number
        });
      }
      
      // Cache the result
      cardSearchCache.set(cacheKey, cards);
      logger.debug(`Cache miss for card search: ${cacheKey}, cached ${cards.length} cards`);
      
      return cards;
    } catch (error) {
      logger.error('Error searching cards by name:', error);
      throw error;
    }
  }

  // Cache key generators
  generateSearchCacheKey(query, uniqueNamesOnly) {
    return `search:${query.toLowerCase()}:${uniqueNamesOnly}`;
  }

  generateLookupCacheKey(query, projection) {
    const queryStr = JSON.stringify(query);
    const projectionStr = JSON.stringify(projection);
    return `lookup:${Buffer.from(queryStr + projectionStr).toString('base64')}`;
  }

  // Cache management methods
  static clearSearchCache() {
    const deleted = cardSearchCache.flushAll();
    logger.info(`Cleared card search cache: ${deleted} entries`);
  }

  static clearLookupCache() {
    const deleted = cardLookupCache.flushAll();
    logger.info(`Cleared card lookup cache: ${deleted} entries`);
  }

  static clearAllCaches() {
    this.clearSearchCache();
    this.clearLookupCache();
  }

  static getCacheStats() {
    return {
      search: {
        keys: cardSearchCache.keys().length,
        hits: cardSearchCache.getStats().hits,
        misses: cardSearchCache.getStats().misses,
        keyspace: cardSearchCache.keys()
      },
      lookup: {
        keys: cardLookupCache.keys().length,
        hits: cardLookupCache.getStats().hits,
        misses: cardLookupCache.getStats().misses,
        keyspace: cardLookupCache.keys()
      }
    };
  }

  async writeCollection(data) {
    try {
      const collection = await this.getCollection();
      logger.info('Clearing the card data collection...');
      const deleteResult = await collection.deleteMany({});
      logger.info(`Deleted ${deleteResult.deletedCount} entries.`);
    
      // Deduplicate data by scryfall_id to prevent unique index violations
      const uniqueData = data.reduce((acc, card) => {
        if (!acc.has(card.scryfall_id)) {
          acc.set(card.scryfall_id, card);
        }
        return acc;
      }, new Map());

      const deduplicatedData = Array.from(uniqueData.values());
      logger.info(`Deduplicated ${data.length} entries to ${deduplicatedData.length} unique entries.`);

      const insertResult = await collection.insertMany(deduplicatedData);
      logger.info(`Inserted ${insertResult.insertedCount} entries.`);
      return true;
    } catch (error) {
      logger.error('Error writing collection data:', error);
      throw new DatabaseError('writeCollection', error.message);
    }
  }
}

function convertPrices(prices) {
  if (!prices) return prices;

  const converted = {};
  for (const key in prices) {
    if (prices[key] != null) {
      converted[key] = Decimal128.fromString(prices[key].toString());
    } else {
      converted[key] = null;
    }
  }
  return converted;
}

export default Card;