import CardPackageCreator from '../services/cardPackageCreator.js';
import CardPackageExporter from '../services/cardPackageExporter.js';

export default {
  createCardPackage: async function (req, res) {
    const games = req.validatedGames
    const defaultSelection = req.validatedDefaultSelection;
    const cardList = req.validatedCardList;
    try {
      const cardPackage = await CardPackageCreator.perform(cardList, games, defaultSelection);
      res.json({ card_package: cardPackage });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create card package.', details: err.message });
    }
  },
  randomPackage: async function (req, res) {
    const games = req.validatedGames
    const defaultSelection = req.validatedDefaultSelection;
    const cardListCount = parseInt(req.query.count) || 10;

    try {
      const cardPackage = await CardPackageCreator.perform_random(cardListCount, games, defaultSelection);
      res.json({ card_package: cardPackage });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create random card package.', details: err.message });
    }
  },
  export: function (req, res) {
    // add cardPackage validation
    const cardPackage = req.body.card_package;
    const type = req.query.type;
    let exportText = '';
    try {
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
      res.status(500).json({ error: 'Failed to export card package.', details: err.message });
    }
  }
}

