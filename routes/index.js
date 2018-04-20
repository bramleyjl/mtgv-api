var express = require('express');
var router = express.Router();
var scriptsController = require('../controllers/scriptsController.js')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/homepage', { title: 'Express' });
});

/* POST card selection page */
router.post('/cardLookup', scriptsController.cardLookup);

/* POST image download page */
router.post('/imageDownload', scriptsController.imageDownload);

module.exports = router;
