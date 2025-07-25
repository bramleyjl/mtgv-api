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
import logger from "../lib/logger.js";
import websocketService from '../services/websocketService.js';

const router = express.Router();

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

router.get('/cards', validateSearchQuery, cardsController.searchCards);

router.post('/card_package',
            validateGameTypes,
            validateCardList,
            validateDefaultSelection,
            cardPackagesController.createCardPackage);
router.get('/card_package/:id', cardPackagesController.getCardPackageById);
router.get('/card_package/random',
           validateGameTypes,
           validateCardCount,
           validateDefaultSelection,
           cardPackagesController.randomPackage);
router.post('/card_package/export',
           validateExportType,
           validateSelectedPrints,
           cardPackagesController.export);

// WebSocket stats endpoint
router.get('/websocket/stats', (req, res) => {
  try {
    const stats = websocketService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting WebSocket stats:', error);
    res.status(500).json({ error: 'Failed to get WebSocket stats' });
  }
});

export default router;