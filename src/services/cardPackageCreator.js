import { AppError } from "../lib/errors.js";
import Card from "../models/card.js";
import logger from "../lib/logger.js";
import { sanitizeCardName } from "../lib/helper.js";
import { performance } from 'perf_hooks';
import NodeCache from 'node-cache';
import { release } from "os";

// cache card prints for 1 hour, package entries for 30 minutes
const cardCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const packageCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

class CardPackageCreator {
  static async perform(cardList, games, defaultSelection) {
    const start = performance.now();
    
    try {
      const cacheKey = this.generatePackageCacheKey(cardList, games, defaultSelection);
      const cachedPackage = packageCache.get(cacheKey);
      if (cachedPackage) { return cachedPackage }
      
      const packageEntries = await this.buildPackageEntries(cardList, games, defaultSelection);
      const cardPackageData = {
        cardList,
        games,
        default_selection: defaultSelection,
        package_entries: packageEntries,
      };
      
      packageCache.set(cacheKey, cardPackageData);
      
      const duration = performance.now() - start;
      logger.info(`Package created in ${duration.toFixed(2)}ms with ${cardList.length} cards`);
      
      return cardPackageData;
    } catch (error) {
      logger.error("Error performing card package creation:", error);
      throw (error instanceof AppError) ? error : new AppError(`Failed to create card package: ${error.message}`);
    }
  }

  static async perform_random(cardListCount, games, defaultSelection) {
    try {
      const randomCardList = await new Card().find_random(cardListCount, games);
      const packageEntries = await this.buildPackageEntries(randomCardList, games, defaultSelection);
      const cardPackageData = {
        cardList: randomCardList,
        games,
        default_selection: defaultSelection,
        package_entries: packageEntries,
      };
      return cardPackageData;
    } catch (error) {
      logger.error("Error performing random card package creation:", error);
      throw (error instanceof AppError) ? error : new AppError(`Failed to create random card package: ${error.message}`);
    }
  }

  // private methods below

  static async buildPackageEntries(cardList, games, defaultSelection) {
    const start = performance.now();
    logger.debug(`Starting to build package entries for ${cardList.length} cards`);
    
    const cardQueries = cardList.map(entry => 
      this.getCardPrintQueries(entry.name, games, defaultSelection)
        .then(cardPrints => ({ entry, cardPrints }))
        .catch(error => {
          logger.error(`Error querying card ${entry.name}:`, error);
          return { entry, cardPrints: [] };
        })
    );
    const results = await Promise.all(cardQueries);

    const package_entries = results.map(({ entry, cardPrints }) => {
      if (cardPrints && cardPrints.length > 0) {
        return this.buildCardSelections(cardPrints, entry.count);
      } else {
        logger.warn(`Card not found: ${entry.name}`);
        return this.buildEmptyCardSelection(entry);
      }
    });
    
    const duration = performance.now() - start;
    logger.debug(`Built ${package_entries.length} package entries in ${duration.toFixed(2)}ms`);
    
    return package_entries;
  }
  
  static async getCardPrintQueries(name, games, defaultSelection) {
    const sanitizedName = sanitizeCardName(name);
    const cacheKey = `card:${sanitizedName}:${games.join(',')}`;

    const cached = cardCache.get(cacheKey);
    if (cached) { return this.applySorting(cached, defaultSelection, games) }

    const projection = Card.SERIALIZED_FIELDS;
    const query = this.buildQueryForCardPrints({ name }, games, defaultSelection);
    const cardModel = new Card();
    const cardPrints = await cardModel.find_by(query, projection);
    
    cardCache.set(cacheKey, cardPrints);
    return cardPrints;
  }

  static applySorting(cardPrints, defaultSelection, games) {
    if (!cardPrints || cardPrints.length <= 1) {
      return cardPrints;
    }
    
    const sortedPrints = [...cardPrints];
    switch (defaultSelection) {
      case 'most_expensive': {
        let priceField = 'prices.usd';
        if (!games.includes('paper') && games.includes('mtgo')) {
          priceField = 'prices.tix';
        }
        
        return sortedPrints.sort((a, b) => {
          const priceA = parseFloat(a?.prices?.[priceField.split('.')[1]] || 0);
          const priceB = parseFloat(b?.prices?.[priceField.split('.')[1]] || 0);
          return priceB - priceA;
        });
      }
      case 'least_expensive': {
        let priceField = 'prices.usd';
        if (!games.includes('paper') && games.includes('mtgo')) {
          priceField = 'prices.tix';
        }
        
        return sortedPrints.sort((a, b) => {
          const priceA = parseFloat(a?.prices?.[priceField.split('.')[1]] || 0);
          const priceB = parseFloat(b?.prices?.[priceField.split('.')[1]] || 0);
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

  static buildQueryForCardPrints(entry, games, defaultSelection) {
    const query = {
      sanitized_name: sanitizeCardName(entry.name),
      games: { $in: games },
    };

    switch (defaultSelection) {
      case 'most_expensive': {
        let priceField = 'prices.usd';
        if (!games.includes('paper') && games.includes('mtgo')) {
          priceField = 'prices.tix';
        }
        query.sort = { [priceField]: -1 };
        break;
      }
      case 'least_expensive': {
        let priceField = 'prices.usd';
        if (!games.includes('paper') && games.includes('mtgo')) {
          priceField = 'prices.tix';
        }
        query.sort = { [priceField]: 1 };
        break;
      }
      case 'oldest':
        query.sort = { released_at: 1 };
        break;
      case 'newest':
      default:
        query.sort = { released_at: -1 };
        break;
    }
    return query;
  }

  static generatePackageCacheKey(cardList, games, defaultSelection) {
    return `package:${JSON.stringify(cardList)}:${games.sort().join(',')}:${defaultSelection}`;
  }

  static buildCardSelections(cardPrints, count) {
    return {
      count,
      oracle_id: cardPrints[0].oracle_id,
      name: cardPrints[0].name,
      card_prints: cardPrints,
      selected_print: cardPrints[0].scryfall_id,
      user_selected: false,
    };
  }

  static buildEmptyCardSelection(entry) {
    return {
      count: entry.count,
      oracle_id: null,
      name: entry.name,
      card_prints: [],
      selected_print: null,
      user_selected: false,
      not_found: true,
    };
  }
}

export default CardPackageCreator;