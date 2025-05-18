import Card from "../models/card.js";
import logger from "../lib/logger.js";
import { sanitizeCardName } from "../lib/helper.js";

class CardPackageCreator {
  static async perform(cardList, games, defaultSelection) {
    try {
      const packageEntries = await this.buildPackageEntries(cardList, games);
      const cardPackageData = {
        cardList,
        games,
        default_selection: defaultSelection,
        package_entries: packageEntries,
      };
      // Optionally persist the package here if needed.
      return cardPackageData;
    } catch (error) {
      logger.error("Error performing card package creation:", error);
      throw error;
    }
  }

  static async perform_random(cardListCount, games, defaultSelection) {
    try {
      const randomCardList = await new Card().find_random(cardListCount, games);
      const packageEntries = await this.buildPackageEntries(randomCardList, games);
      const cardPackageData = {
        cardList: randomCardList,
        games,
        default_selection: defaultSelection,
        package_entries: packageEntries,
      };
      return cardPackageData;
    } catch (error) {
      logger.error("Error performing random card package creation:", error);
      throw error;
    }
  }

  static async buildPackageEntries(cardList, games) {
    const package_entries = [];
    for (const entry of cardList) {
      const query = {
        sanitized_name: sanitizeCardName(entry.name),
        games: { $in: games },
      };
      try {
        const cardPrints = await new Card().find_by(query);
        let cardSelections;
        if (cardPrints && cardPrints.length > 0) {
          cardSelections = this.buildCardSelections(cardPrints, entry.count);
        } else {
          cardSelections = this.buildEmptyCardSelection(entry);
        }
        package_entries.push(cardSelections);
      } catch (error) {
        logger.error(`Error building package entries for card ${entry.name}:`, error);
        package_entries.push(this.buildEmptyCardSelection(entry));
      }
    }
    return package_entries;
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