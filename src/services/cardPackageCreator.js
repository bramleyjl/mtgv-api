const Card = require("../models/card");
const CardPackage = require("../models/cardPackage");
const helper = require('../helpers/helper');

class CardPackageCreator {
  static async perform(cardList, filters, defaultSelection) {
    const packageEntries = await buildPackageEntries(cardList, filters)
    const cardPackageData = {
      cardList: cardList,
      filters: filters,
      default_selection: defaultSelection,
      package_entries: packageEntries
    }
    // save cardPackage minus the card_prints for persistence

    // var cardPackage = new CardPackage();
    // await cardPackage.create(cardPackageData);
    return cardPackageData;
  }

  static async perform_random(cardListCount, filters, defaultSelection) {
    // update random search to include filters
    const randomCardList = await new Card().find_random(cardListCount);
    const packageEntries = await buildPackageEntries(randomCardList, filters)
    const cardPackageData = {
      filters: filters,
      default_selection: defaultSelection,
      package_entries: packageEntries
    }
    return cardPackageData;
  }
}

async function buildPackageEntries(cardList, filters) {
  package_entries = [];
  for (const entry of cardList) {
    const count = entry['count'];
    const sanitizedName = helper.sanitizeCardName(entry['name']);
    const cardPrints = await new Card().find_by('sanitized_name', sanitizedName);
    // update to include filters
    const cardSelections = await buildCardSelections(cardPrints, count);
    package_entries.push(cardSelections);
  }
  return package_entries;
}

function buildCardSelections(cardPrints, count) {
  return {
    count: count,
    oracle_id: cardPrints[0].oracle_id,
    name: cardPrints[0].name,
    card_prints: cardPrints,
    selected_print: cardPrints[0].scryfall_id,
    user_selected: false,
  }
}

module.exports = CardPackageCreator;