const Promise = require("bluebird");
const { text } = require("body-parser");
const cards = require("../models/cards");
const tcgPlayer = require("../models/tcgplayer");
const axios = require('axios');

module.exports = {
  imageLookup: function (req, res) {
    const cardInput = req.body.cardList.split("\n");
    let cardNameCounts = [];
    for (card of cardInput) {
      if (card.length > 0) {
        let cardNameCount = cards.getCardNameCount(card);
        cardNameCounts.push(cardNameCount);
      }
    }
    Promise.map(
      cardNameCounts,
      function (card) {
        return cards.getVersionsArray(card.name);
      },
      { concurrency: 1 }
    )
    .then(results => {
      const imagesArray = cards.prepareVersionSelectList(cardNameCounts, results);
      res.json({
        cardList: req.body.cardList,
        cardImages: imagesArray,
        userAlert: "",
      });
    });
  },
  exportTextList: function(req, res) {
    const cardVersions = req.body.cards;
    let textListWithSet = cards.getTextList(cardVersions, 'arena');
    res.set('Content-Type', 'text/plain');
    res.send(textListWithSet);
  },
  tcgPlayerMassEntry: function(req, res) {
    const cardVersions = req.body.cards;
    const massEntryBody = cards.getTextList(cardVersions, 'tcgApi');
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
};
