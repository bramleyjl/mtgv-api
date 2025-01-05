const tcgpClient = require('../lib/tcgplayer');
const axios = require('axios');

class CardPackageExporter {
  static async exportTCGPlayer(cardPackage) {
    // const exportObj = req.body.exportObj;
    //     const massEntryBody = card.getTextList(exportObj.cards, 'tcgApi');
      const token = await tcgpClient.getBearerToken();
      const tcgHeaders = {
        Authorization: `bearer ${token}`,
        getExtendedFields: "true",
      };
      var textExport = '';
      cardPackage.package_entries.forEach(entry => {
        const selectedPrint = entry.card_prints.find(print => print.scryfall_id === entry.selected_print);
        const textEntry = `${entry.count} ${entry.card_name} [${selectedPrint.set}] ${selectedPrint.collector_number}`;
        textExport += encodeURIComponent(textEntry + '\n');
      });
      const response = await axios({
        method: 'post',
        url: 'https://api.tcgplayer.com/massentry', 
        headers: tcgHeaders,
        data: { c: textExport }
      });
      // console.log(textExport)
      // console.log(decodeURIComponent(textExport))
      // console.log(`https://tcgplayer.com${response.request.path}`)
  }
  
  static exportText(cardPackage) {
    var textExport = '';
    cardPackage.package_entries.forEach(entry => {
      const selectedPrint = entry.card_prints.find(print => print.scryfall_id === entry.selected_print);
      const textEntry = `${entry.count} ${entry.card_name} ${selectedPrint.set} ${selectedPrint.collector_number}`;
      textExport += textEntry + '\n';
    });
    return textExport.trim();
  }
}


module.exports = CardPackageExporter; 
