let cards = require("../models/cards");
let Promise = require("bluebird");
let archiver = require("archiver");
let request = require("request");

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
            card = card.replace(/\d+[\sxX\s]*/, "");
            const apostrophe = /\'/gi;
            card = card.replace(apostrophe, "");
            cardNames.push([card, cardCount]);
        }
        cards.getBearerToken()
        .then(function(token) {
            //card lookup
            return Promise.map(
                cardNames,
                function(name) {
                    return cards.imageLookup(name[0], token);
                },
                { concurrency: 1 }
            )
        })
        .then(function(results) {
            //replace whitespace for future image filenames and attach names to image links
            let displayMap = new Array();
            let i = 0;
            for (name of cardNames) {
                name[0] = name[0].replace(/,/g, "");
                name[0] = name[0].replace(/ /g, "_");
                var card = {};
                //check if scryfall api call was completed successfully
                if (results[i] === undefined) {
                    card[name[0]] = [
                        "No Results Found",
                        ["https://img.scryfall.com/errors/missing.jpg"]
                    ];
                    card["count"] = name[1];
                    displayMap[i] = card;
                } else {
                    card[name[0]] = results[i];
                    card["count"] = name[1];
                    displayMap[i] = card;
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
    pdfPrepare: function(req, res) {
        let downloadList = [];
        for (var i = 0; i < req.body.versions.length; i++) {
            var editionArray = Object.values(req.body.versions[i])[0];
            var cardCount = Object.values(req.body.versions[i])[1];
            var links = editionArray[2];
            for (var j = 0; j < links.length; j++) {
                var transformed = j === 0 ? false : true;
                var name = editionArray[0][j];
                var link = editionArray[2][j];
                if (link !== "https://img.scryfall.com/errors/missing.jpg") {
                    link = link.replace("small", "png").replace("jpg", "png");
                    downloadList.push([name, link, transformed, cardCount]);
                }
            }
        }
        console.log(downloadList);

        // var time = Math.floor(Date.now() / 100);
        // //iterate over hi-rez images and prepare them for DB
        // let imageCounter = 0;
        // let allImages = [];
        // for (image of results) {
        //     //ignore card names that didn't convert to images successfully
        //     if (image === undefined) {
        //         imageCounter += 1;
        //         continue;
        //     } else {
        //         //prevents incrementing for transformed cards and marks them with '.5'
        //         if (Object.values(image)[0][1] === false) {
        //             imageCounter += 1;
        //             var cardOrder = imageCounter;
        //         } else {
        //             var cardOrder = imageCounter + 0.5;
        //         }
        //         var remoteUrl = Object.values(image)[0][0];
        //         var remoteUrlName = Object.keys(image)[0];
        //         var pngDoc = {
        //             insert: time,
        //             type: "card",
        //             name: `(${cardOrder})` + remoteUrlName + ".png",
        //             link: remoteUrl,
        //             Date: new Date()
        //         };
        //         allImages.push(pngDoc);
        //     }
        // }
        // //insert collection into DB
        // const collection = req.db.collection("hiRezFiles");
        // collection.insert({
        //     insert: time,
        //     type: "script",
        //     text: req.body.script,
        //     Date: new Date()
        // });
        // collection.insert(allImages);
        // res.json({
        //     downloadLink: time
        // });
    },
    packageDownload: function(req, res) {
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
