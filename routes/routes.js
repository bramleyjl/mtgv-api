var express = require('express');
var router = express.Router();
var cardsController = require('../controllers/cardsController.js')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/homepage', { title: 'Express' });
});

/* POST card selection page */
router.post('/imageSelect', cardsController.imageLookup);

/* POST card download */
router.post('/imageDownload', cardsController.imageDownload);

module.exports = router;