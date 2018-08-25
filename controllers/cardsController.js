let cards = require('../models/cards');
let Promise = require('bluebird');
let archiver = require('archiver');
let request = require('request');

module.exports = {
    imageLookup: function(req, res) {
        // parse script input for all card names and add them to an array for image searching
        const script = req.body.script;
        const nameFilter = /\[.*?\]/ig;
        const pulledNames = script.match(nameFilter);
        //error handling for no brackets
        if (pulledNames === null) {
            const noCardsResponse = 'No cards were detected, make sure you\'re putting card names in [brackets]!'; 
            res.json({
                cardImages: [],
                indexedScript: req.body.script,
                userAlert: noCardsResponse
            });
        }
        //add indexing to script card names
        let cardIndex = 1
        function scriptIndexer(match) {
            match = `(${cardIndex.toString()})` + match;
            cardIndex += 1;
            return match;
        }
        let indexedScript = script.replace(nameFilter, scriptIndexer);
        //remove captured brackets and apostrophes
        var cardNames = new Array;
        for (card of pulledNames) {
            const apostrophe = /\'/ig;
            card = card.replace(apostrophe, '');
            cardNames.push(card.substring(1, card.length -1));
        }
        //card lookup
        Promise.map(cardNames, function(name) {
            return cards.imageLookup(name);
        }, {concurrency: 1})
        .then(function(results) {
            //replace whitespace for future image filenames and attach names to image links
            let displayMap = new Array;
            let i = 0;
            for (name of cardNames) {
                name = name.replace(/,/g, "");
                name = name.replace(/ /g, "_");
                var card = {};
                //check if scryfall api call was completed successfully 
                if (results[i] === undefined) {
                    card[name] = [ 'No Results Found', ['https://img.scryfall.com/errors/missing.jpg'] ];
                    displayMap[i] = card;
                } else {
                    card[name] = results[i];          
                    displayMap[i] = card;
                }
                i ++;
            }
            return displayMap;
        })
        .then(function(results) {
            res.json({
                cardImages: results,
                indexedScript: indexedScript,
                userAlert: ''
            });
        });
    },
    hiRezPrepare: function(req, res) {
        //split card names, edition names, and edition links
        let namesPlusLinks = []
        for (var i = 0; i < req.body.versions.length; i ++) {
            namesPlusLinks.push(Object.values(req.body.versions[i])[0]);
        }
        //check for dual-faced cards and split into two links if found
        let downloadList = [];
        for (var card in namesPlusLinks) {
            var links = namesPlusLinks[card];
            for (var j = 0; j < links[0].length; j ++) { 
                //set flag for dual-faced reverse side
                if (j === 0) {
                    downloadList.push([links[1][j], links[0][j], false]) 
                } else {
                    downloadList.push([links[1][j], links[0][j], true])                    
                }
            }
        }
        Promise.map(downloadList, function(edition) {
            return cards.hiRezDownload(edition[0], edition[1], edition[2]);
        })
        .then(function(results) {
            var time = Math.floor(Date.now() / 100);
            //iterate over hi-rez images and prepare them for DB
            let imageCounter = 0;
            let allImages = [];
            for (image of results) {
                //ignore card names that didn't convert to images successfully
                if (image === undefined) {
                    imageCounter += 1;
                    continue;
                } else {
                    //prevents incrementing for transformed cards and marks them with '.5'
                    if (Object.values(image)[0][1] === false) {
                        imageCounter += 1;
                        var cardOrder = imageCounter;
                    } else {
                        var cardOrder = imageCounter + .5;
                    }
                    var remoteUrl = Object.values(image)[0][0];
                    var remoteUrlName = Object.keys(image)[0];
                    var pngDoc = {
                        insert: time, 
                        type: 'card', 
                        name: `(${cardOrder})` + remoteUrlName + '.png', 
                        link: remoteUrl, 
                        "Date": new Date()
                    };
                    allImages.push(pngDoc);
                }
            }
            //insert collection into DB
            const collection = req.db.collection('hiRezFiles');
            collection.insert({
                insert: time, 
                type: 'script', 
                text: req.body.script, 
                "Date": new Date()
            });
            collection.insert(allImages);
            res.json({
                downloadLink: time
            });
        });
    },
    packageDownload: function(req, res) {
        //calls image links, filtered by 'insert' collection value
        const collectionId = parseInt(req.params.zipId)
        const collection = req.db.collection('hiRezFiles');
        collection.find({ insert: collectionId }).toArray(function(err, docs) {
            if (err) throw err;
            packageZip(docs);
        })
        function packageZip(docs) {
            let zip = archiver('zip');
            zip.pipe(res);
            for (var i = docs.length - 1; i >= 0; i--) {
                if (docs[i].type === 'card') {
                    zip.append( request( docs[i].link ), { name: docs[i].name } );
                } else {
                    zip.append(docs[i].text, { name: 'script.txt' });
                }
            }
            zip.on('error', function(err) {
              throw err;
            });
            zip.finalize();
        }     
    },
    randomCards: function(req, res) {
        namesArray = [];
        for (var i = 0; i < 5; i ++) {
            namesArray[i] = '';
        }
        Promise.map(namesArray, function(index) {
            return cards.getRandomCard();
        })
        .then(function(results) {
            for (var j = 0; j < results.length; j++) {
                results[j] = `${results[j]}`;
            }
            results = String(results);
            res.json({randomCards: results});
        })
    }
};