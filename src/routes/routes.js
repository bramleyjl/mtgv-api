import express from "express";
import { validateGameTypes, validateCardList } from '../middleware/validateParams.js';
import cardPackagesController from "../controllers/cardPackagesController.js";

const router = express.Router();

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

router.post('/card_package', validateGameTypes, validateCardList, cardPackagesController.createCardPackage);
router.get('/card_package/random', validateGameTypes, cardPackagesController.randomPackage);
router.post("/card_package/export", cardPackagesController.export);

export default router;