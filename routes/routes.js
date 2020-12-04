var express = require("express");
var router = express.Router();
var cardsController = require("../controllers/cardsController.js");
var pdfsController = require('../controllers/pdfsController');

router.get("/api/randomCards", cardsController.randomCards);
router.post("/api/imageSelect", cardsController.imageLookup);

router.get("/api/download/:pdf", pdfsController.packageDownload);
router.post("/api/preparePdf", pdfsController.preparePdf);

module.exports = router;
