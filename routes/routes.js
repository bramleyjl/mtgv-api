var express = require('express');
var router = express.Router();
var cardsController = require('../controllers/cardsController.js')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/homepage');
});

/* POST card selection page */
router.post('/imageSelect', cardsController.imageLookup);

/* POST card download */
router.post('/imageDownload', cardsController.imageDownload);

/* GET random cards function */
router.get('/randomCards', cardsController.randomCards);

module.exports = router;