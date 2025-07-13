import { AppError } from "../lib/errors.js";
import Card from "../models/card.js";
import logger from "../lib/logger.js";
import { sanitizeCardName } from "../lib/helper.js";
import { performance } from 'perf_hooks';
import NodeCache from 'node-cache';
import crypto from 'crypto';

// Keep package cache for now, but remove card cache since it's now centralized in Card model
const packageCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

class CardPackageCreator {
  static async perform(cardList, game, defaultSelection) {
    const start = performance.now();

    try {
      const cacheKey = this.generatePackageCacheKey(cardList, game);
      const cachedPackage = packageCache.get(cacheKey);
      
      if (cachedPackage) { 
        logger.debug(`Package cache hit: ${cacheKey}`);
        const packageData = JSON.parse(cachedPackage);
        
        return this.applySortingToPackage(packageData, defaultSelection);
      }
      
      const packageEntries = await this.buildPackageEntries(cardList, game);
      const cardPackageData = {
        card_list: cardList,
        game,
        package_entries: packageEntries,
      };
      
      packageCache.set(cacheKey, JSON.stringify(cardPackageData));
      const duration = performance.now() - start;
      logger.info(`Package created in ${duration.toFixed(2)}ms with ${cardList.length} cards`);
      
      return this.applySortingToPackage(cardPackageData, defaultSelection);
    } catch (error) {
      logger.error("Error performing card package creation:", error);
      throw (error instanceof AppError) ? error : new AppError(`Failed to create card package: ${error.message}`);
    }
  }

  static async perform_random(cardListCount, game, defaultSelection) {

    try {
      const cardModel = new Card();
      const randomCardList = await cardModel.find_random(cardListCount, game);
      const cardPackage = await this.perform(randomCardList, game, defaultSelection);
      
      return cardPackage;
    } catch (error) {
      logger.error("Error performing random card package creation:", error);
      throw (error instanceof AppError) ? error : new AppError(`Failed to create random card package: ${error.message}`);
    }
  }

  // private methods below

  static async buildPackageEntries(cardList, game) {
    const start = performance.now();
    logger.debug(`Starting to build package entries for ${cardList.length} cards`);
    
    const cardQueries = cardList.map(entry => 
      this.getCardPrintQueries(entry.name, game)
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
  
  static async getCardPrintQueries(name, game) {
    const sanitizedName = sanitizeCardName(name);
    const cardModel = new Card();
    const projection = Card.SERIALIZED_FIELDS;
    const cardPrints = await cardModel.find_by({
      sanitized_name: sanitizedName,
      games: game,
    }, projection);
    
    return this.applySorting(cardPrints, 'newest', game); 
  }

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

  static generatePackageCacheKey(cardList, game) {
    // Create a normalized card list (sorted by name for consistency)
    const normalizedCards = cardList
      .map(entry => `${entry.name}:${entry.count}`)
      .sort()
      .join('|');
    
    // Create a hash of the card list + game
    const contentToHash = `${normalizedCards}|${game}`;
    const hash = crypto.createHash('md5').update(contentToHash).digest('hex');
    
    return `package:${hash}`;
  }

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