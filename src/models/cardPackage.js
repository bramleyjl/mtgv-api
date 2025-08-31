import Model from './model.js';
import redisWrapper from '../lib/redis.js';
import logger from '../lib/logger.js';
import Card from './card.js';

class CardPackage extends Model {
  constructor() {
    super('cardPackages');
  }

  // Get minimal state from Redis (for internal operations)
  static async getMinimalById(packageId) {
    try {
      const cached = await redisWrapper.get(`package:${packageId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting minimal package from Redis:', error);
      return null;
    }
  }

  static async getById(packageId) {
    try {
      const cached = await redisWrapper.get(`package:${packageId}`);
      if (!cached) return null;
      
      const minimalPackage = JSON.parse(cached);
      logger.info(`Retrieved minimal package from Redis: ${JSON.stringify(minimalPackage.package_entries.map(e => ({ name: e.name, selected_print: e.selected_print, user_selected: e.user_selected })))}`);
      
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
          
          logger.info(`Fetched ${cardPrints.length} prints for ${entry.name}, original selected_print: ${entry.selected_print}, user_selected: ${entry.user_selected}`);
          
          const sortedPrints = this.applySorting(cardPrints, minimalPackage.default_selection, minimalPackage.game);
          
          const reconstructedEntry = {
            ...entry,
            card_prints: sortedPrints,
            selected_print: entry.selected_print,
            user_selected: entry.user_selected
          };
          
          logger.info(`Reconstructed entry for ${entry.name}: selected_print=${reconstructedEntry.selected_print}, user_selected=${reconstructedEntry.user_selected}`);
          
          reconstructedEntries.push(reconstructedEntry);
        } else {
          // Handle cards not found
          reconstructedEntries.push({
            ...entry,
            card_prints: [],
            not_found: true,
            selected_print: entry.selected_print,
            user_selected: entry.user_selected
          });
        }
      }

      const result = {
        ...minimalPackage,
        package_entries: reconstructedEntries
      };
      
      logger.info(`Final reconstructed package entries: ${JSON.stringify(result.package_entries.map(e => ({ name: e.name, selected_print: e.selected_print, user_selected: e.user_selected })))}`);
      
      return result;
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
      
      await redisWrapper.set(`package:${cardPackage.package_id}`, JSON.stringify(minimalState));
      logger.debug(`Package saved to Redis: ${cardPackage.package_id}`);
    } catch (error) {
      logger.error('Error saving package to Redis:', error);
      throw error;
    }
  }

  static async delete(packageId) {
    try {
      await redisWrapper.del(`package:${packageId}`);
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
    logger.info(`applySortingToPackage called with defaultSelection: ${defaultSelection}`);
    logger.info(`Input package entries: ${JSON.stringify(packageData.package_entries.map(e => ({ name: e.name, selected_print: e.selected_print, user_selected: e.user_selected })))}`);
    
    const sortedEntries = packageData.package_entries.map(entry => {
      // Only apply default selection if the user hasn't made a selection
      if (!entry.user_selected && entry.card_prints && entry.card_prints.length > 0) {
        const sortedPrints = this.applySorting(entry.card_prints, defaultSelection, packageData.game);
        const result = {
          ...entry,
          card_prints: sortedPrints,
          selected_print: sortedPrints[0]?.scryfall_id || entry.selected_print
        };
        logger.info(`Applied default selection for ${entry.name}: selected_print=${result.selected_print}`);
        return result;
      } else {
        // Preserve user selections by only sorting the card_prints array
        const sortedPrints = this.applySorting(entry.card_prints, defaultSelection, packageData.game);
        const result = {
          ...entry,
          card_prints: sortedPrints
          // Keep the existing selected_print and user_selected values
        };
        logger.info(`Preserved user selection for ${entry.name}: selected_print=${result.selected_print}, user_selected=${result.user_selected}`);
        return result;
      }
    });
    
    const result = {
      ...packageData,
      default_selection: defaultSelection,
      package_entries: sortedEntries
    };
    
    logger.info(`Output package entries: ${JSON.stringify(result.package_entries.map(e => ({ name: e.name, selected_print: e.selected_print, user_selected: e.user_selected })))}`);
    
    return result;
  }
}

export default CardPackage;
