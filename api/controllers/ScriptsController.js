/**
 * ScriptsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let scripts = require('../models/Scripts');
var Promise = require("bluebird");

module.exports = {
	cardLookup: function(req, res) {
		const nameFilter = /\[.*?\]/ig;
		const lookupNames = req.body.script.match(nameFilter);

		//remove captured brackets to leave clean names
		var cardNames = new Array;
		for (card of lookupNames) {
			let trimmedName = 
			cardNames.push(card.substring(1, card.length -1));
		}
		
		let cardImages = new Array;
		Promise.map(cardNames, function(name) {
			return scripts.imageLookup(name);
		}, {concurrency: 1})
		.then(function(results) {
			return res.view('pages/results', {
				cardImages: results
			});
		})
	}

};