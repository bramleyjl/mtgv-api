var express = require("express");
var router = express.Router();
var cardsController = require("../controllers/cardsController.js");

router.post("/api/imageSelect", cardsController.imageLookup);

router.post("/api/getFinalizedImages", cardsController.getFinalizedImages);

router.get("/api/download/:pdf", cardsController.packageDownload);

router.get("/api/randomCards", cardsController.randomCards);

module.exports = router;
