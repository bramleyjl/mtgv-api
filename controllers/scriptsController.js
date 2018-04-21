let scripts = require('../models/scripts');
let Promise = require('bluebird');
let archiver = require('archiver');
let request = require('request');

module.exports = {
    cardLookup: function(req, res) {
        //parse script input for all card names and add them to an array for image searching
        const script = req.body.script
        const nameFilter = /\[.*?\]/ig;
        const lookupNames = script.match(nameFilter);

        //add indexing to script card names
        let cardIndex = 1
        function scriptIndexer(match) {
            match = `(${cardIndex.toString()})` + match;
            cardIndex += 1;
            return match;
        }
        let indexedScript = script.replace(nameFilter, scriptIndexer)

        //remove captured brackets
        var cardNames = new Array;
        for (card of lookupNames) {
            cardNames.push(card.substring(1, card.length -1));
        }
        //card lookup
        let cardImages = new Array;
        Promise.map(cardNames, function(name) {
            return scripts.imageLookup(name);
        }, {concurrency: 1})
        //replace whitespace for future image filenames and attach names to image links
        .then(function(results) {
            let displayMap = new Map;
            let i = 0;
            for (name of cardNames) {
                name = name.replace(/,/g, "")
                name = name.replace(/ /g, "_")
                displayMap.set(name, results[i]);
                i ++;
            }
            return displayMap;
        })
        .then(function(results) {
            res.render('pages/imageSelect', {
                cardImages: results,
                baseScript: indexedScript
            });
        });
    },
    imageDownload: function(req, res) {
        let selectedEditions = new Array;
        for(var key in req.body) {
            if (key !== 'script') selectedEditions.push([key, req.body[key]])
        }
        Promise.map(selectedEditions, function(edition) {
            return scripts.hiRezDownload(edition[0], edition[1]);
        })
        .then(function(results) {
            
            //create zip file and add script to it
            let zip = archiver('zip')
            res.header('Content-Type', 'application/zip');
            res.header('Content-Disposition', 'attachment; filename="mtgScriptImages.zip"');
            zip.pipe(res);
            zip.append(req.body.script, { name: 'script.txt'})

            //name and add each image to zip
            let imageCounter = 0;
            for (image of results) {
                imageCounter += 1;
                var remoteUrl = Object.values(image)[0]
                var remoteUrlName = Object.keys(image)[0]
                zip.append( request( remoteUrl ), { name: `(${imageCounter})` + remoteUrlName + '.png' } );
            }

            zip.on('error', function(err) {
              throw err;
            });

            zip.finalize();
           
        });
    }
};