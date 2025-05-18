class CardPackageExporter {
  static exportTCGPlayer(cardPackage) {
    var exportText = '';
    cardPackage.package_entries.forEach(entry => {
      if (entry.not_found) return;
      const selectedPrint = entry.card_prints.find(print => print.scryfall_id === entry.selected_print);
      const textEntry = `${entry.count}-${selectedPrint.tcgplayer_id}||`;
      exportText += textEntry;
    });
    const uriEncodedText = encodeURIComponent(exportText.slice(0, -2));
    return "https://www.tcgplayer.com/massentry?productline=Magic&c=" + uriEncodedText;
  }

  static exportText(cardPackage) {
    var textExport = '';
    cardPackage.package_entries.forEach(entry => {
      if (entry.not_found) return;
      const selectedPrint = entry.card_prints.find(print => print.scryfall_id === entry.selected_print);
      const textEntry = `${entry.count} ${entry.name} ${selectedPrint.set} ${selectedPrint.collector_number}`;
      textExport += textEntry + '\n';
    });
    return textExport.trim();
  }
}

export default CardPackageExporter;
