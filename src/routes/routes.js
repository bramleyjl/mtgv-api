import express from "express";
import { validateGameTypes,
         validateCardList,
         validateDefaultSelection,
         validateCardCount,
         validateExportType } from '../middleware/validateParams.js';
import cardPackagesController from "../controllers/cardPackagesController.js";

const router = express.Router();

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

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
            cardPackagesController.export);

export default router;