const CardPackageCreator = require('../services/cardPackageCreator');
const CardPackageExporter = require('../services/cardPackageExporter');

module.exports = {
  createCardPackage: async function (req, res) {
    const filters = req.query.filters;
    const defaultSelection = req.query.defaultSelection;
    const cardList = req.body.card_list;
    const cardPackage = await CardPackageCreator.perform(cardList, filters, defaultSelection);
    res.json({ card_package: cardPackage });
  },
  randomPackage: async function (req, res) {
    const filters = req.query.filters;
    const defaultSelection = req.query.defaultSelection;
    const cardListCount = parseInt(req.query.count);
    const cardPackage = await CardPackageCreator.perform_random(cardListCount, filters, defaultSelection);
    res.json({ card_package: cardPackage });
  },
  export: async function (req, res) {
    const cardPackage = req.body.card_package;
    const type = req.query.type;
    var exportText = '';
    switch (type) {
      case 'tcgplayer':
        exportText = await CardPackageExporter.exportTCGPlayer(cardPackage);
      case 'text':
        exportText = CardPackageExporter.exportText(cardPackage);
    }
    res.json({ export_text: exportText, type: type });
  }
}

