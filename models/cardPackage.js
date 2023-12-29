const axios = require('axios');
const mongo = require('../helpers/mongo');
const helper = require('../helpers/helper');
const VersionList = require('../models/versionList');

class CardPackage {
  constructor(cardPackageData) {
    this.cardList = cardPackageData.cardList
    this.versionLists = cardPackageData.versionLists
  }

  static async build(cardList) {
    var versionLists = [];
    for (const card of cardList) { versionLists.push(await VersionList.build(card)) }
    const cardPackageData = {
      cardList: cardList,
      versionLists: versionLists
    }
    return new CardPackage(cardPackageData);
  }
}

module.exports = CardPackage
