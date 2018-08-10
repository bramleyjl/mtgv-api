var express = require('express');
var router = express.Router();
var cardsController = require('../controllers/cardsController.js')

/* finds small images for version select*/
router.post('/api/imageSelect', cardsController.imageLookup);

/* prepares hi-rez versions of cards */
router.post('/api/hiRezPrepare', cardsController.hiRezPrepare);

/* downloads zip of hi-rez images */
router.get('/api/download/:zipId', cardsController.packageDownload);

/* random cards function */
router.get('/api/randomCards', cardsController.randomCards);

module.exports = router;
