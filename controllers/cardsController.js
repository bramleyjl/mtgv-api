const cards = require("../models/cards");
const fs = require("fs");
const Promise = require("bluebird");
const pdfs = require('../models/pdfs');
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
  preparePdf: function (req, res) {
    let downloadList = [];
    req.body.versions.forEach(function (card) {
      var editionObject = Object.values(card)[0];
      for (var j = 0; j < editionObject.image.length; j++) {
        var downloadObject = Object.create(editionObject);
        downloadObject.name = editionObject.name[j];
        downloadObject.image = editionObject.image[j]
          .replace("small", "png")
          .replace("jpg", "png");
        downloadObject.transform = j === 0 ? false : true;
        if (downloadObject.transform === false) {
          downloadObject.tcgId = editionObject.tcgId;
          downloadObject.tcgPurchase = editionObject.tcgPurchase;
          downloadObject.normalPrice = editionObject.normalPrice;
          downloadObject.foilPrice = editionObject.foilPrice;
        }
        downloadObject.count = card.count;
        downloadList.push(downloadObject);
      }
    });
    pdfs.buildPDF(downloadList).then(function (pdfFileName) {
      res.json({
        pdfLink: pdfFileName,
      });
    });
  },
  packageDownload: function (req, res) {
    let fileName = req.params.pdf + ".pdf";
    let filePath = "./assets/pdfs/" + fileName;
    fs.exists(filePath, function (exists) {
      if (exists) {
        res.writeHead(200, {
          "Content-Type": "text/pdf",
          "Content-Disposition": "attachment; filename=" + fileName,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("ERROR File does not exist");
      }
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
