var express = require('express');
var router = express.Router();
var cardsController = require('../controllers/cardsController.js')

/* POST card selection page */
router.post('/api/imageSelect', cardsController.imageLookup);

/* POST card download */
router.post('/api/hiRezPrepare', cardsController.hiRezPrepare);

/* GET random cards function */
router.get('/api/download/:zipId', cardsController.packageDownload);

/* GET random cards function */
router.get('/api/randomCards', cardsController.randomCards);

module.exports = router;