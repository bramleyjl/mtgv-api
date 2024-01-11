const VersionList = require('../models/versionList');
const CardPackage = require("../models/cardPackage");
const scryfall = require ('../helpers/scryfall');


const Promise = require("bluebird");
const tcgPlayer = require("../models/tcgplayer");
const axios = require('axios');
const helper = require('../helpers/helper');
const mongo = require('../helpers/mongo');

module.exports = {
  getCardVersions: async function (req, res) {
    const versionList = await VersionList.build({ name: req.params.card, count: 1 });
    res.json({ versionList: versionList });
  },
  getCardPackage: async function (req, res) {
    const cardPackage = await CardPackage.build(req.body.cardList)
    res.json({ cardPackage: cardPackage });
  },
  randomCards: async function (req, res) {
    const cardListCount = parseInt(req.query.count);
    const cardList = await mongo.getRandomCards(cardListCount);
    res.json({ cardList: cardList });
  },
  exportVersionedCardList: function(req, res) {
    console.log(req.body)

    res.json({ request: req.body })

    // const exportObj = req.body.exportObj;
    // let textListWithSet = card.getTextList(exportObj.cards, 'arena');
    // res.set('Content-Type', 'text/plain');
    // res.send(textListWithSet);
  },
  //
  // old methods
  //
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

