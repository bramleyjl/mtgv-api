import express from "express";
import { validateGameTypes,
         validateCardList,
         validateDefaultSelection,
         validateCardCount,
         validateExportType,
         validateSelectedPrints,
         validateSearchQuery } from '../middleware/validateParams.js';
import cardPackagesController from "../controllers/cardPackagesController.js";
import cardsController from "../controllers/cardsController.js";

const router = express.Router();

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

router.get('/cards', validateSearchQuery, cardsController.searchCards);

router.post('/card_package',
            validateGameTypes,
            validateCardList,
            validateDefaultSelection,
            cardPackagesController.createCardPackage);
router.get('/card_package/random',
           validateGameTypes,
           validateCardCount,
           validateDefaultSelection,
           cardPackagesController.randomPackage);
router.post("/card_package/export",
            validateExportType,
            validateSelectedPrints,
            cardPackagesController.export);

export default router;