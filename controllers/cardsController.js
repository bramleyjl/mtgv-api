let cards = require("../models/cards");
let Promise = require("bluebird");
let archiver = require("archiver");
let request = require("request");
let fs = require("fs");

module.exports = {
  imageLookup: function (req, res) {
    var cardInput = req.body.script.split("\n");
    var cardNames = new Array();
    for (card of cardInput) {
      //normalize card counts and strip apostrophes
      var cardCount = card.match(/\d+[\sxX\s]*/);
      if (cardCount === null) {
        cardCount = 1;
      }
      cardCount = String(cardCount).replace(/\s*\D\s*/, "");
      cardName = card.replace(/\d+[\sxX\s]*/, "");
      const apostrophe = /\'/gi;
      cardName = cardName.replace(apostrophe, "");
      card = {
        name: cardName,
        count: cardCount,
      };
      cardNames.push(card);
    }
    cards
      .getBearerToken()
      .then(function (token) {
        //card lookup
        return Promise.map(
          cardNames,
          function (card) {
            return cards.imageLookup(card.name, token);
          },
          { concurrency: 1 }
        );
      })
      .then(function (results) {
        //replace whitespace for future image filenames and attach names to image links
        let displayMap = new Array();
        let i = 0;
        for (card of cardNames) {
          card.name = card.name.replace(/,/g, "");
          card.name = card.name.replace(/ /g, "_");
          var displayObj = {};
          //check if scryfall api call was completed successfully
          if (results[i] === undefined) {
            displayObj[card.name] = [
              "No Results Found",
              ["https://img.scryfall.com/errors/missing.jpg"],
            ];
            displayObj["count"] = card.count;
            displayMap[i] = displayObj;
          } else {
            displayObj[card.name] = results[i];
            displayObj["count"] = card.count;
            displayMap[i] = displayObj;
          }
          i++;
        }
        res.json({
          cardImages: displayMap,
          indexedScript: req.body.script,
          userAlert: "",
        });
      });
  },
  getFinalizedImages: function (req, res) {
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
    cards.buildPDF(downloadList).then(function (pdfFileName) {
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
    }).then(function (results) {
      results.forEach(function (name, index) {
        results[index] = String(Math.floor(Math.random() * 4) + 1 + " " + name);
      });
      results = results.join("\n");
      res.json({ randomCards: results });
    });
  },
};
