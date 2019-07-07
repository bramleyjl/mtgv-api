let cards = require("../models/cards");
let Promise = require("bluebird");
let archiver = require("archiver");
let request = require("request");
const PDFDocument = require('pdfkit');

module.exports = {
    imageLookup: function(req, res) {
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
                count: cardCount
            }
            cardNames.push(card);
        }
        cards.getBearerToken()
        .then(function(token) {
            //card lookup
            return Promise.map(
                cardNames,
                function(card) {
                    return cards.imageLookup(card.name, token);
                },
                { concurrency: 1 }
            )
        })
        .then(function(results) {
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
                        ["https://img.scryfall.com/errors/missing.jpg"]
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
                userAlert: ""
            });
        });
    },
    getFinalizedImages: function(req, res) {
        let downloadList = [];
        req.body.versions.forEach(function(card) {
            var editionObject = Object.values(card)[0];
            for (var j = 0; j < editionObject.image.length; j++) {
                var downloadObject = Object.create(editionObject);
                downloadObject.name = editionObject.name[j];
                console.log(downloadObject.name);
                downloadObject.image = editionObject.image[j];
                downloadObject.image = downloadObject.image.replace("small", "png").replace("jpg", "png");
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
        res.json({
            cardImages: downloadList,
            indexedScript: req.body.script,
            userAlert: ""
        });
    },
    packageDownload: function(req, res) {

       //  Promise.map(downloadList, function(editionObject) {
       //      return cards.getPNG(editionObject);
       //  })
       //  .then(function(results) {
       //      var time = Math.floor(Date.now() / 100);
       //      //iterate over hi-rez images and prepare them for DB
       //      let imageCounter = 0;
       //      let allImages = [];
       //      for (image of results) {
       //          //ignore card names that didn't convert to images successfully
       //          if (image === undefined) {
       //              imageCounter += 1;
       //              continue;
       //          } else {
       //              //prevents incrementing for transformed cards and marks them with '.5'
       //              if (Object.values(image)[0][1] === false) {
       //                  imageCounter += 1;
       //                  var cardOrder = imageCounter;
       //              } else {
       //                  var cardOrder = imageCounter + 0.5;
       //              }
       //              var remoteUrl = Object.values(image)[0][0];
       //              var remoteUrlName = Object.keys(image)[0];
       //              var pngDoc = {
       //                  insert: time,
       //                  type: "card",
       //                  name: `(${cardOrder})` + remoteUrlName + ".png",
       //                  link: remoteUrl,
       //                  Date: new Date()
       //              };
       //              allImages.push(pngDoc);
       //          }
       //      }
       //      //insert collection into DB
       //      const collection = req.db.collection("hiRezFiles");
       //      collection.insert({
       //          insert: time,
       //          type: "script",
       //          text: req.body.script,
       //          Date: new Date()
       //      });
       //      collection.insert(allImages);
       //      res.json({
       //          downloadLink: time
       //      });
       // })

        //calls image links, filtered by 'insert' collection value
        const zipId = parseInt(req.params.zipId);
        const collection = req.db.collection("hiRezFiles");
        collection.find({ insert: zipId }).toArray(function(err, docs) {
            if (err) throw err;
            packageZip(docs);
        });
        function packageZip(docs) {
            let zip = archiver("zip");
            zip.pipe(res);
            for (var i = docs.length - 1; i >= 0; i--) {
                if (docs[i].type === "card") {
                    zip.append(request(docs[i].link), { name: docs[i].name });
                } else {
                    zip.append(docs[i].text, { name: "script.txt" });
                }
            }
            zip.on("error", function(err) {
                throw err;
            });
            zip.finalize();
        }
    },
    randomCards: function(req, res) {
        namesArray = [];
        for (var i = 0; i < 5; i++) {
            namesArray[i] = "";
        }
        Promise.map(namesArray, function(index) {
            return cards.getRandomCard();
        }).then(function(results) {
            results.forEach(function(name, index) {
                results[index] = String(
                    Math.floor(Math.random() * 4) + 1 + " " + name
                );
            });
            results = results.join("\n");
            res.json({ randomCards: results });
        });
    }
};
