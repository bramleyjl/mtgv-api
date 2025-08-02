import Model from './model.js';
import redisClient from '../lib/redis.js';
import logger from '../lib/logger.js';
import Card from './card.js';

class CardPackage extends Model {
  constructor() {
    super('cardPackages');
  }

  // Get minimal state from Redis (for internal operations)
  static async getMinimalById(packageId) {
    try {
      const cached = await redisClient.get(`package:${packageId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting minimal package from Redis:', error);
      return null;
    }
  }

  static async getById(packageId) {
    try {
      const cached = await redisClient.get(`package:${packageId}`);
      if (!cached) return null;
      
      const minimalPackage = JSON.parse(cached);
      
      // Dynamically reconstruct full package with card data
      const cardModel = new Card();
      const reconstructedEntries = [];

      for (const entry of minimalPackage.package_entries) {
        if (entry.oracle_id) {
          // Fetch card prints for this oracle_id and game using find_by
          const cardPrints = await cardModel.find_by(
            { oracle_id: entry.oracle_id, games: minimalPackage.game },
            Card.SERIALIZED_FIELDS
          );
          
          // Apply sorting based on default_selection
          const sortedPrints = this.applySorting(cardPrints, minimalPackage.default_selection, minimalPackage.game);
          
          reconstructedEntries.push({
            ...entry,
            card_prints: sortedPrints
          });
        } else {
          // Handle cards not found
          reconstructedEntries.push({
            ...entry,
            card_prints: [],
            not_found: true
          });
        }
      }

      return {
        ...minimalPackage,
        package_entries: reconstructedEntries
      };
    } catch (error) {
      logger.error('Error getting package from Redis:', error);
      return null;
    }
  }

  static async save(cardPackage) {
    if (!cardPackage.package_id) throw new Error('Missing package_id');
    
    try {
      // Store only minimal mutable state in Redis
      const minimalState = {
        package_id: cardPackage.package_id,
        card_list: cardPackage.card_list,
        game: cardPackage.game,
        default_selection: cardPackage.default_selection,
        package_entries: cardPackage.package_entries.map(entry => ({
          oracle_id: entry.oracle_id,
          selected_print: entry.selected_print,
          user_selected: entry.user_selected,
          count: entry.count,
          name: entry.name
        }))
      };
      
      await redisClient.set(`package:${cardPackage.package_id}`, JSON.stringify(minimalState));
      logger.debug(`Package saved to Redis: ${cardPackage.package_id}`);
    } catch (error) {
      logger.error('Error saving package to Redis:', error);
      throw error;
    }
  }

  static async delete(packageId) {
    try {
      await redisClient.del(`package:${packageId}`);
      logger.debug(`Package deleted from Redis: ${packageId}`);
    } catch (error) {
      logger.error('Error deleting package from Redis:', error);
      throw error;
    }
  }

  static async updateSelectedPrint(packageId, oracleId, scryfallId) {
    try {
      logger.info(`updateSelectedPrint called: packageId=${packageId}, oracleId=${oracleId}, scryfallId=${scryfallId}`);
      
      // Use getMinimalById to get only the minimal state for updates
      const minimalPackage = await this.getMinimalById(packageId);
      logger.info(`getMinimalById result: ${minimalPackage ? 'found' : 'not found'}`);
      
      if (minimalPackage && Array.isArray(minimalPackage.package_entries)) {
        logger.info(`Package has ${minimalPackage.package_entries.length} entries`);
        
        const entry = minimalPackage.package_entries.find(e => e.oracle_id === oracleId);
        logger.info(`Found entry for oracleId ${oracleId}: ${entry ? 'yes' : 'no'}`);
        
        if (entry) {
          logger.info(`Updating entry: selected_print from ${entry.selected_print} to ${scryfallId}`);
          entry.selected_print = scryfallId;
          entry.user_selected = true;
          
          await this.save(minimalPackage);
          logger.debug(`Updated selected print for package ${packageId}: ${oracleId} -> ${scryfallId}`);
          return true;
        } else {
          logger.warn(`No entry found for oracleId ${oracleId}`);
        }
      } else {
        logger.warn(`Package not found or has no entries: ${packageId}`);
      }
      return false;
    } catch (error) {
      logger.error('Error updating selected print in Redis:', error);
      return false;
    }
  }

  // Centralized sorting logic
  static applySorting(cardPrints, defaultSelection, game) {
    if (!cardPrints || cardPrints.length <= 1) {
      return cardPrints;
    }
    
    const sortedPrints = [...cardPrints];
    switch (defaultSelection) {
      case 'most_expensive': {
        let priceField = 'prices.usd';
        if (game === 'mtgo') {
          priceField = 'prices.tix';
        }
        return sortedPrints.sort((a, b) => {
          const priceAraw = a?.prices?.[priceField.split('.')[1]];
          const priceBraw = b?.prices?.[priceField.split('.')[1]];
          const priceA = (priceAraw !== undefined && priceAraw !== null && !isNaN(parseFloat(priceAraw))) ? parseFloat(priceAraw) : -Infinity;
          const priceB = (priceBraw !== undefined && priceBraw !== null && !isNaN(parseFloat(priceBraw))) ? parseFloat(priceBraw) : -Infinity;
          return priceB - priceA;
        });
      }
      case 'least_expensive': {
        let priceField = 'prices.usd';
        if (game === 'mtgo') {
          priceField = 'prices.tix';
        }
        return sortedPrints.sort((a, b) => {
          const priceAraw = a?.prices?.[priceField.split('.')[1]];
          const priceBraw = b?.prices?.[priceField.split('.')[1]];
          const priceA = (priceAraw !== undefined && priceAraw !== null && !isNaN(parseFloat(priceAraw))) ? parseFloat(priceAraw) : Infinity;
          const priceB = (priceBraw !== undefined && priceBraw !== null && !isNaN(parseFloat(priceBraw))) ? parseFloat(priceBraw) : Infinity;
          return priceA - priceB;
        });
      }
      case 'oldest':
        return sortedPrints.sort((a, b) => 
          new Date(a.released_at) - new Date(b.released_at)
        );
      case 'newest':
      default:
        return sortedPrints.sort((a, b) => 
          new Date(b.released_at) - new Date(a.released_at)
        );
    }
  }

  // Helper method to apply sorting to a full package
  static applySortingToPackage(packageData, defaultSelection) {
    const sortedEntries = packageData.package_entries.map(entry => ({
      ...entry,
      card_prints: this.applySorting(entry.card_prints, defaultSelection, packageData.game)
    }));
    
    return {
      ...packageData,
      default_selection: defaultSelection,
      package_entries: sortedEntries
    };
  }
}

export default CardPackage;
