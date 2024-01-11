const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController.js");

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

// new routes
router.get('/random_cards', cardsController.randomCards);
router.get('/:card/versions', cardsController.getCardVersions);
router.post('/card_package', cardsController.getCardPackage);

// legacy routes
router.post("/export/versioned_card_list", cardsController.exportVersionedCardList);
router.post("/tcgPlayerMassEntry", cardsController.tcgPlayerMassEntry);

module.exports = router;