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
			console.log("controller function name: " + result.name)
			console.log("controller function name: " + result.image_uris.png)
			res.redirect(result.image_uris.large)
		});
	}
};
