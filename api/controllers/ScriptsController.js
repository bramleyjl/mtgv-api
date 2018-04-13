let Scripts = require('../models/Scripts');
let fs = require('fs');
let Promise = require('bluebird');

module.exports = {
	cardLookup: function(req, res) {
		//parse script input for all card names and add them to an array
		const script = req.body.script
		const nameFilter = /\[.*?\]/ig;
		const lookupNames = script.match(nameFilter);

		//remove captured brackets
		var cardNames = new Array;
		for (card of lookupNames) {
			cardNames.push(card.substring(1, card.length -1));
		}
		
		//card lookup
		let cardImages = new Array;
		Promise.map(cardNames, function(name) {
			return Scripts.imageLookup(name);
		}, {concurrency: 1})
		//replace whitespace for future image filenames and attach names to image links
		.then(function(results) {
			let displayMap = new Map;
			let i = 0;
			for (name of cardNames) {
				name = name.replace(/ /g, "_")
				displayMap.set(name, results[i]);
				i ++;
			}
			return displayMap;
		})
		.then(function(results) {
			res.view('pages/imageSelect', {
				cardImages: results,
				baseScript: script
			});
		});
	},

	imageDownload: function(req, res) {
		let selectedEditions = new Array;
		for(var key in req.body) {
			if (key !== 'script') selectedEditions.push([key, req.body[key]])
		}
		Promise.map(selectedEditions, function(edition) {
			return Scripts.hiRezDownload(edition[0], edition[1]);
		})
		.then(function(results) {
			res.view('pages/imageDownload', {
				imageDownloads: results
			});
		});
	}

};