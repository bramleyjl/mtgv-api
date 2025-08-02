import CardPackageCreator from '../services/cardPackageCreator.js';
import CardPackageExporter from '../services/cardPackageExporter.js';
import CardPackage from '../models/cardPackage.js';

export default {
  createCardPackage: async function (req, res, next) {
    try {
      const game = req.validatedGame;
      const defaultSelection = req.validatedDefaultSelection;
      const cardList = req.validatedCardList;
      const packageId = req.body && req.body.package_id ? req.body.package_id : undefined;
      const cardPackage = await CardPackageCreator.perform(cardList, game, defaultSelection, packageId);
      res.json({ card_package: cardPackage });
    } catch (err) {
      next(err);
    }
  },
  randomPackage: async function (req, res, next) {
    try {
      const game = req.validatedGame;
      const defaultSelection = req.validatedDefaultSelection;
      const cardListCount = req.validatedCount;
      const cardPackage = await CardPackageCreator.perform_random(cardListCount, game, defaultSelection);
      res.json({ card_package: cardPackage });
    } catch (err) {
      next(err);
    }
  },
  export: async function (req, res, next) {
    try {
      const packageId = req.body.package_id;
      const type = req.validatedExportType;
      
      if (!packageId) {
        return res.status(400).json({ error: 'Missing package ID' });
      }

      // Get package data from Redis
      const cardPackage = await CardPackage.getById(packageId);
      if (!cardPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }

      let exportText = '';
      switch (type) {
        case 'tcgplayer':
          exportText = await CardPackageExporter.exportTCGPlayerFromPackage(cardPackage);
          break;
        case 'text':
          exportText = await CardPackageExporter.exportTextFromPackage(cardPackage);
          break;
        default:
          throw new Error('Invalid export type specified.');
      }
      res.json({ export_text: exportText, type: type });
    } catch (err) {
      next(err);
    }
  },
  getCardPackageById: async function (req, res, next) {
    try {
      const packageId = req.params.id;
      if (!packageId) {
        return res.status(400).json({ error: 'Missing package ID' });
      }
      const cardPackage = await CardPackage.getById(packageId);
      if (!cardPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }
      res.json({ card_package: cardPackage });
    } catch (err) {
      next(err);
    }
  }
}

