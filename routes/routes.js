var express = require("express");
var router = express.Router();
var cardsController = require("../controllers/cardsController.js");

router.get("/api/randomCards", cardsController.randomCards);
router.post("/api/imageSelect", cardsController.imageLookup);

module.exports = router;
