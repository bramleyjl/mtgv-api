/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  'get /': { view: 'pages/homepage' },

  'post /cardLookup': 'ScriptsController.cardLookup',

  'post /imageDownload': 'ScriptsController.imageDownload'

};