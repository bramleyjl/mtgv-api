const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController.js");

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

router.get("/randomCards", cardsController.randomCards);
router.post("/versionSelect", cardsController.imageLookup);
router.post("/exportTextList", cardsController.exportTextList);
router.post("/tcgPlayerMassEntry", cardsController.tcgPlayerMassEntry);

module.exports = router;