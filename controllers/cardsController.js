const cards = require("../models/cards");
const Promise = require("bluebird");
const tcgplayer = require("../models/tcgplayer");

module.exports = {
  imageLookup: function (req, res) {
    var cardInput = req.body.cardList.split("\n");
    var cardNames = new Array();
    for (card of cardInput) {
      let cardNameCount = cards.getCardNameCount(card);
      cardNames.push(cardNameCount);
    }
    tcgplayer.getBearerToken()
    .then(token => {
      return Promise.map(
        cardNames,
        function (card) {
          return cards.getVersionsObject(card.name, token);
        },
        { concurrency: 1 }
      );
    })
    .then(results => {
      var imagesArray = cards.prepareImagesArray(results, cardNames);
      res.json({
        cardList: req.body.cardList,
        cardImages: imagesArray,
        userAlert: "",
      });
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
