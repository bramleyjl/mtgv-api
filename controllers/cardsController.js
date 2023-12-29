const Promise = require("bluebird");
const tcgPlayer = require("../models/tcgplayer");
const axios = require('axios');
const helper = require('../helpers/helper');
const mongo = require('../helpers/mongo');
const VersionList = require('../models/versionList');
const CardPackage = require("../models/cardPackage");
const scryfall = require ('../helpers/scryfall');

module.exports = {
  getCardVersions: async function (req, res) {
    const versionList = await VersionList.build({ name: req.params.card, count: 1 });
    res.json({ versionList: JSON.stringify(versionList)});
  },
  getCardPackage: async function (req, res) {
    var cardPackage = await CardPackage.build(req.body.cardList)
    res.json({ cardPackage: JSON.stringify(cardPackage) });
  },
  randomCards: async function (req, res) {
    namesArray = [];
    for (var i = 0; i < process.env.RANDOM_LIST_SIZE; i++) { namesArray[i] = '' }
    Promise.map(namesArray, function () { return scryfall.getRandomCard() })
    .then(results => {
      results.forEach(function (name, index) {
        results[index] = String(Math.floor(Math.random() * 4) + 1 + " " + name);
      });
      results = results.join("\n");
      res.json({ cardList: results });
    });
  },
  //
  // old methods
  //
  exportTextList: function(req, res) {
    const exportObj = req.body.exportObj;
    let textListWithSet = card.getTextList(exportObj.cards, 'arena');
    res.set('Content-Type', 'text/plain');
    res.send(textListWithSet);
  },
  tcgPlayerMassEntry: function(req, res) {
    const exportObj = req.body.exportObj;
    const massEntryBody = card.getTextList(exportObj.cards, 'tcgApi');
    tcgPlayer.getBearerToken()
    .then(token => {
      var tcgHeaders = {
        Authorization: `bearer ${token}`,
        getExtendedFields: "true",
      };
      return axios({
        method: 'post',
        url: 'https://api.tcgplayer.com/massentry', 
        headers: tcgHeaders,
        data: { c: massEntryBody }
      });
    })
    .then(response => {
      res.json({
        tcgMassEntry: `https://tcgplayer.com${response.request.path}`
      });
    })
    .catch(e => {
      console.log(e);
    });
  },
};

