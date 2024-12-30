const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController.js");
const cardPackagesController = require("../controllers/cardPackagesController.js");

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

// updated routes
router.get('/card_package/random', cardPackagesController.randomPackage);
router.post('/card_package', cardPackagesController.createCardPackage);

// legacy routes
router.post("/card_package/export", cardPackagesController.export);
// router.post("/tcgPlayerMassEntry", cardsController.tcgPlayerMassEntry);

module.exports = router;