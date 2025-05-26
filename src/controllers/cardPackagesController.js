import CardPackageCreator from '../services/cardPackageCreator.js';
import CardPackageExporter from '../services/cardPackageExporter.js';

export default {
  createCardPackage: async function (req, res, next) {
    try {
      const games = req.validatedGames;
      const defaultSelection = req.validatedDefaultSelection;
      const cardList = req.validatedCardList;
      const cardPackage = await CardPackageCreator.perform(cardList, games, defaultSelection);
      res.json({ card_package: cardPackage });
    } catch (err) {
      next(err);
    }
  },
  randomPackage: async function (req, res, next) {
    try {
      const games = req.validatedGames;
      const defaultSelection = req.validatedDefaultSelection;
      const cardListCount = req.validatedCount;
      const cardPackage = await CardPackageCreator.perform_random(cardListCount, games, defaultSelection);
      res.json({ card_package: cardPackage });
    } catch (err) {
      next(err);
    }
  },
  export: function (req, res, next) {
    try {
    const cardPackage = req.body.card_package;
    const type = req.query.type;
    let exportText = '';
      switch (type) {
        case 'tcgplayer':
          exportText = CardPackageExporter.exportTCGPlayer(cardPackage);
          break;
        case 'text':
          exportText = CardPackageExporter.exportText(cardPackage);
          break;
        default:
          throw new Error('Invalid export type specified.');
      }
      res.json({ export_text: exportText, type: type });
    } catch (err) {
      next(err);
    }
  }
}

