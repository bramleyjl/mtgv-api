import { AppError } from "../lib/errors.js";
import Card from "../models/card.js";
import logger from "../lib/logger.js";
import { sanitizeCardName } from "../lib/helper.js";
import { performance } from 'perf_hooks';
import crypto from 'crypto';
import CardPackage from '../models/cardPackage.js';

class CardPackageCreator {
  static async perform(cardList, game, defaultSelection, packageId) {
    const start = performance.now();

    try {
      packageId = packageId ?? crypto.randomUUID();
      const cachedPackage = await CardPackage.getById(packageId);
      if (cachedPackage) { 
        logger.debug(`Package cache hit: package:${packageId}`);
        return CardPackage.applySortingToPackage(cachedPackage, defaultSelection);
      }
      
      const packageEntries = await this.buildPackageEntries(cardList, game, defaultSelection);
      const cardPackageData = {
        package_id: packageId,
        card_list: cardList,
        game,
        package_entries: packageEntries,
      };
      
      await CardPackage.save(cardPackageData);
      const duration = performance.now() - start;
      logger.info(`Package created in ${duration.toFixed(2)}ms with ${cardList.length} cards (id: ${packageId})`);
      
      return cardPackageData;
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

  static async buildPackageEntries(cardList, game, defaultSelection) {
    const start = performance.now();
    logger.debug(`Starting to build package entries for ${cardList.length} cards`);
    
    const cardQueries = cardList.map(entry => 
      this.getCardPrintQueries(entry.name, game, defaultSelection)
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
  
  static async getCardPrintQueries(name, game, defaultSelection) {
    const sanitizedName = sanitizeCardName(name);
    const cardModel = new Card();
    const projection = Card.SERIALIZED_FIELDS;
    const cardPrints = await cardModel.find_by({
      sanitized_name: sanitizedName,
      games: game,
    }, projection);
    
    return CardPackage.applySorting(cardPrints, defaultSelection, game); 
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