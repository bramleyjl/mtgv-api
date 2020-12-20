const cards = require("../models/cards");
const Promise = require("bluebird");
const tcgplayer = require("../models/tcgplayer");

module.exports = {
  imageLookup: function (req, res) {
    var cardInput = req.body.cardList.split("\n");
    var cardNameCounts = [];
    for (card of cardInput) {
      if (card.length > 0) {
        let cardNameCount = cards.getCardNameCount(card);
        cardNameCounts.push(cardNameCount);
      }
    }
    tcgplayer.getBearerToken()
    .then(token => {
      return Promise.map(
        cardNameCounts,
        function (card) {
          return cards.getVersionsArray(card.name, token);
        },
        { concurrency: 1 }
      );
    })
    .then(results => {
      var imagesArray = cards.prepareCardListImages(cardNameCounts, results);
      res.json({
        cardList: req.body.cardList,
        cardImages: imagesArray,
        userAlert: "",
      });
    });
  },
  exportTextList: function(req, res) {
    const cardVersions = req.body.cards;
    let textListWithSet = cards.getTextList(cardVersions, 'string');
    res.set('Content-Type', 'text/plain');
    res.send(textListWithSet);
  },
  tcgPlayerMassEntry: function(req, res) {
    const cardVersions = req.body.cards;
    const massEntryBody = cards.getTextList(cardVersions, 'tcgApi');
    res.json({})
  },
  // exportCsvList: function(req, res) {
  //   const cardVersions = req.body.cards;
  // },
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
