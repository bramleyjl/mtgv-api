let Scripts = require('../models/Scripts');
let Promise = require('bluebird');

module.exports = {
	cardLookup: function(req, res) {
		//parse script input for all card names and add them to an array
		const script = req.body.script
		const nameFilter = /\[.*?\]/ig;
		const lookupNames = script.match(nameFilter);

		//remove captured brackets to leave clean names
		var cardNames = new Array;
		for (card of lookupNames) {
			let trimmedName = 
			cardNames.push(card.substring(1, card.length -1));
		}
		
		let cardImages = new Array;
		Promise.map(cardNames, function(name) {
			return Scripts.imageLookup(name);
		}, {concurrency: 1})
		.then(function(results) {			
			res.view('pages/imageSelect', {
				cardImages: results,
				baseScript: script
			});
		})
	},

	imageDownload: function(req, res) {
		let selectedEditions = new Array;
		for(var key in req.body) {
			if (key !== 'script') selectedEditions.push(req.body[key])
		}
		console.log(req.body.script)
		console.log(selectedEditions);
		res.view('pages/imageDownload')
	}

};