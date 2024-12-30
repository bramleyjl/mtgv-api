class CardPackageExporter {
  static perform(type, cardPackage) {
    switch (type) {
      case 'text':
        return exportAsText(cardPackage);
    }
  }
}

function exportAsText(cardPackage) {
  var textExport = '';
  cardPackage.package_entries.forEach(entry => {
    const selectedPrint = entry.card_prints.find(print => print.scryfall_id === entry.selected_print);
    const textEntry = `${entry.count} ${entry.card_name} ${selectedPrint.set} ${selectedPrint.collector_number}`;
    textExport += textEntry + '\n';
  });
  return textExport.trim();
}

module.exports = CardPackageExporter;