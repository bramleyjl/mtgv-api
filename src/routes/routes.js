import express from "express";
import { validateGameTypes,
         validateCardList,
         validateDefaultSelection,
         validateCardCount,
         validateExportType,
         validateSearchQuery } from '../middleware/validateParams.js';
import { strictLimiter, searchLimiter } from '../middleware/rateLimiter.js';
import cardPackagesController from "../controllers/cardPackagesController.js";
import cardsController from "../controllers/cardsController.js";
import logger from "../lib/logger.js";
import websocketService from '../services/websocketService.js';

const router = express.Router();

router.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });

// Card search with lenient rate limiting
router.get('/cards', searchLimiter, validateSearchQuery, cardsController.searchCards);

// Card package creation with strict rate limiting (expensive operation)
router.post('/card_package',
            strictLimiter,
            validateGameTypes,
            validateCardList,
            validateDefaultSelection,
            cardPackagesController.createCardPackage);

// Random package generation with strict rate limiting
router.get('/card_package/random',
           strictLimiter,
           validateGameTypes,
           validateCardCount,
           validateDefaultSelection,
           cardPackagesController.randomPackage);

// Package retrieval - no special rate limiting needed
router.get('/card_package/:id', cardPackagesController.getCardPackageById);

// Export with moderate rate limiting
router.post('/card_package/export',
           strictLimiter,
           validateExportType,
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
