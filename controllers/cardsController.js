const Promise = require("bluebird");
const cards = require("../models/cards");
const tcgPlayer = require("../models/tcgplayer");
const axios = require('axios');

module.exports = {
  getCardVersions: function (req, res) {
    const cardName = req.params.card;
    cards.getVersions(cardName)
    .then(results => {
      res.json(results);
    });  
  },
  getCardListVersions: function (req, res) {
    const cardInput = req.body.cardList;
    Promise.map(cardInput, function (card) {
      return cards.getVersions(card.name) 
    }, { concurrency: 1 })
    .then(results => {
      const imagesArray = cards.prepareVersionSelectList(cardInput, results);
      res.json({ cardList: req.body.cardList,
                 cardImages: imagesArray,
                 userAlert: "" });
    });
  },
  randomCards: function (req, res) {
    namesArray = [];
    for (var i = 0; i < 5; i++) {
      namesArray[i] = "";
    }
    Promise.map(namesArray, function (index) {
      return cards.getRandomCard();
    })
    .then(results => {
      results.forEach(function (name, index) {
        results[index] = String(Math.floor(Math.random() * 4) + 1 + " " + name);
      });
      results = results.join("\n");
      res.json({ randomCards: results });
    });
  },
  //
  // old methods
  //
  exportTextList: function(req, res) {
    const exportObj = req.body.exportObj;
    let textListWithSet = cards.getTextList(exportObj.cards, 'arena');
    res.set('Content-Type', 'text/plain');
    res.send(textListWithSet);
  },
  tcgPlayerMassEntry: function(req, res) {
    const exportObj = req.body.exportObj;
    const massEntryBody = cards.getTextList(exportObj.cards, 'tcgApi');
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
