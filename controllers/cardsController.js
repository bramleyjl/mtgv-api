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
            console.log(results)
            //replace whitespace for future image filenames and attach names to image links
            let displayMap = new Object;
            let i = 0;
            for (name of cardNames) {
                name = name.replace(/,/g, "");
                name = name.replace(/ /g, "_");
                //check if scryfall api call was completed successfully 
                if (results[i] === undefined) {
                    displayMap[name] = [[ 'No Results Found', ['https://img.scryfall.com/errors/missing.jpg'] ]];
                } else {
                    displayMap[name] = results[i];          
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
        //pull selected edition data and get .png images 
        let selectedEditions = new Array;
        for(var key in req.body) {
            if (key === 'script') continue;
            //check for version select & choose first version if not
            if ((typeof req.body[key]) === 'string') {
                selectedEditions.push([key, req.body[key]]);
            } else {
                selectedEditions.push([key, req.body[key][0]]);                
            }
        }
        //check for dual-faced cards and split into two links if found
        let downloadList = new Array;
        for (var card of selectedEditions) {
            card[1] = card[1].split(',')
            for (var i = 0; i < card[1].length; i ++) {
                //change name for dual-faced reverse side
                if (i !== 0) {
                    downloadList.push([`(reverse)${card[0]}`, card[1][i]])                    
                } else {
                downloadList.push([card[0], card[1][i]])
                }
            }
        }
        Promise.map(downloadList, function(edition) {
            return cards.hiRezDownload(edition[0], edition[1]);
        })
        .then(function(results) {
            //create zip file and add script to it
            let zip = archiver('zip');
            res.header('Content-Type', 'application/zip');
            res.header('Content-Disposition', 'attachment; filename="mtgScriptImages.zip"');
            zip.pipe(res);
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