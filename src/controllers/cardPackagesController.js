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
  export: function (req, res) {
    const type = req.query.type;
    const cardPackage = req.body.card_package;
    const exportText = CardPackageExporter.perform(type, cardPackage);
    res.json({ export_text: exportText });
  },
  exportTCGPlayer: async function (req, res) {
    // const exportObj = req.body.exportObj;
        // const massEntryBody = card.getTextList(exportObj.cards, 'tcgApi');
        // tcgPlayer.getBearerToken()
        // .then(token => {
        //   var tcgHeaders = {
        //     Authorization: `bearer ${token}`,
        //     getExtendedFields: "true",
        //   };
        //   return axios({
        //     method: 'post',
        //     url: 'https://api.tcgplayer.com/massentry', 
        //     headers: tcgHeaders,
        //     data: { c: massEntryBody }
        //   });
        // })
        // .then(response => {
        //   res.json({
        //     tcgMassEntry: `https://tcgplayer.com${response.request.path}`
        //   });
        // })
        // .catch(e => {
        //   console.log(e);
        // });
  }
}

