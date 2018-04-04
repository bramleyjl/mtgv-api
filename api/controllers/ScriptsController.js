/**
 * ScriptsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let scripts = require('../models/Scripts')

module.exports = {
	cardLookup: function(req, res) {
		var imageLink = scripts.cardLookup(req.body.script)
		imageLink.then( function(result) {
			const cardImages = result;
			return res.view('pages/results', {
				cardImages: cardImages
			});
		});
	}
};
