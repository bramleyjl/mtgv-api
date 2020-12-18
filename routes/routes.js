var express = require("express");
var router = express.Router();
var cardsController = require("../controllers/cardsController.js");

router.get("/api/randomCards", cardsController.randomCards);
router.post("/api/versionSelect", cardsController.imageLookup);
router.post("/api/exportTextList", cardsController.exportTextList);
// router.post("/api/exportCsvList", cardsController.exportCsvList);

module.exports = router;
