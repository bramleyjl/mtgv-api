const axios = require('axios');
const mongo = require('../helpers/mongo');
const helper = require('../helpers/helper');
const Card = require ('../models/card');

class VersionList {
  constructor(versionListData) {
    this.card_name = versionListData.cardName
    this.count = versionListData.count
    this.selected_version = versionListData.cardVersions[0].set
    this.user_selected = false
    this.card_versions = versionListData.cardVersions
  }

  static async build(card) {
    var builtCardVersions = [];
    const sanitizedName = helper.sanitizeCardName(card.name);
    const cardVersions = await mongo.getCardVersions('sanitized_name', sanitizedName);
    if (cardVersions.length == 0) {
      // if name is blank try scryfall fuzzy search
      builtCardVersions.push(new Card({ name: card.name, sanitized_name: sanitizedName }));
    } else {
      for (const version of cardVersions) { builtCardVersions.push(new Card(version)) };
    }
    const versionListData = {
      cardName: builtCardVersions[0].name,
      count: card.count,
      cardVersions: builtCardVersions
    }
    return new VersionList(versionListData);
  }
}

module.exports = VersionList