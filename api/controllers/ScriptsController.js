/**
 * ScriptsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let scripts = require('../models/Scripts')

module.exports = {
	cardLookup: function(req, res) {

		const nameFilter = /\[.*?\]/ig;
		const cardNames = req.body.script.match(nameFilter);
		//remove captured brackets to leave clean names
		var newCardNames = new Array;
		for (cards of cardNames) {
			newCardNames.push(cards.substring(1, cards.length -1));
		}
		console.log(newCardNames)

		var imageLink = scripts.cardLookup(newCardNames)
		imageLink.then( function(result) {
			const cardImages = result;
			return res.view('pages/results', {
				cardImages: cardImages
			});
		});
	}
};