let cards = require('../models/cards');
let Promise = require('bluebird');
let archiver = require('archiver');
let request = require('request');
//let temp = require('temp');
//var tempfs = require('temp-fs');
let fs = require('fs');


module.exports = {
    imageLookup: function(req, res) {
        // parse script input for all card names and add them to an array for image searching
        const script = req.body.script;
        const nameFilter = /\[.*?\]/ig;
        const pulledNames = script.match(nameFilter);
        //error handling for no brackets
        if (pulledNames === null) {
            res.render('error', {
                status: '204',
                message: 'Don\'t forget to put your card names in [brackets]!'
            });
        }
        //add indexing to script card names
        let cardIndex = 1
        function scriptIndexer(match) {
            match = `(${cardIndex.toString()})` + match;
            cardIndex += 1;
            return match;
        }
        let indexedScript = script.replace(nameFilter, scriptIndexer)
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
                indexedScript: indexedScript
            });
        });
    },
    imageDownload: function(req, res) {
        //split card names, edition names, and edition links
        let namesPlusLinks = {}
        for (var i = 0; i < req.body.versions.length; i ++) {
            let links = Object.values(Object.values(req.body.versions[i])[0])[0];
            namesPlusLinks[Object.keys(req.body.versions[i])] = links;
        }
        //check for dual-faced cards and split into two links if found
        let downloadList = [];
        for (var card in namesPlusLinks) {
            var name = card;
            var links = namesPlusLinks[card];
            for (var i = 0; i < links.length; i ++) {
                //change name for dual-faced reverse side
                if (i !== 0) {
                    downloadList.push([`(reverse)${name}`, links[i]])                    
                } else {
                    downloadList.push([name, links[i]])
                }
            }
        }
        Promise.map(downloadList, function(edition) {
            return cards.hiRezDownload(edition[0], edition[1]);
        })
        .then(function(results) {
            //create zip file and add script to it
            var time = Math.floor(Date.now() / 1000);
            var output = fs.createWriteStream(`./public/downloads/${time}.zip`);
            let zip = archiver('zip');
            zip.pipe(output);
            zip.append(req.body.script, { name: 'script.txt'});
            //name and add each image to zip
            let imageCounter = 0;
            for (image of results) {              
                //ignore card names that didn't convert to images successfully
                if (image === undefined) {
                    imageCounter += 1;
                    continue;
                } else {
                    //prevents incrementing for (reverse) cards
                    if (Object.keys(image)[0].indexOf('(reverse)') === -1) imageCounter += 1;
                    var remoteUrl = Object.values(image)[0];
                    var remoteUrlName = Object.keys(image)[0];
                    zip.append( request( remoteUrl ), { name: `(${imageCounter})` + remoteUrlName + '.png' } );
                }
            }
            zip.on('error', function(err) {
              throw err;
            });
            zip.finalize();
            res.json({
                downloadLink: time
            });
        });
    },
    download: function(req, res) {
        const zipId = req.params.zipId
        res.download(`./public/downloads/${zipId}.zip`, 'mtgScript.zip', function(err){
          if (err) {
            // Handle error, but keep in mind the response may be partially-sent
            // so check res.headersSent
            throw err;
          } else {
            console.log(`Success! Package ${zipId} downloaded!`)
          }
        });        
    },
    randomCards: function(req, res) {
        namesArray = [];
        for (var i = 0; i < 5; i ++) {
            namesArray[i] = '';
        }
        Promise.map(namesArray, function(index) {
            return cards.getRandomCard()
        })
        .then(function(results) {
            for (var j = 0; j < results.length; j++) {
                results[j] = ` ${results[j]}`
            }
            results = String(results)
            res.render('pages/homepage', {scriptPreset: results})
        })
    }
};