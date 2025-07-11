import Card from "../models/card.js";
import logger from "../lib/logger.js";

class CardPackageExporter {  
  static async exportTCGPlayer(selectedCards) {
    try {
      const entries = [];
      entries.length = selectedCards.length;

      const cardDetails = await Promise.all(
        selectedCards.map(card => this.getCardById(card.scryfall_id))
      );

      for (let i = 0; i < selectedCards.length; i++) {
        const card = cardDetails[i];
        if (!card || !card.tcgplayer_id) continue;
        entries[i] = `${selectedCards[i].count}-${card.tcgplayer_id}`;
      }
      
      const exportText = entries.filter(Boolean).join('||');
      const uriEncodedText = encodeURIComponent(exportText);
      return "https://www.tcgplayer.com/massentry?productline=Magic&c=" + uriEncodedText;
    } catch (error) {
      logger.error('Error in exportTCGPlayer:', error);
      throw error;
    }
  }

  static async exportText(selectedCards) {
    try {
      const entries = [];
      entries.length = selectedCards.length;

      const cardDetails = await Promise.all(
        selectedCards.map(card => this.getCardById(card.scryfall_id))
      );

      for (let i = 0; i < selectedCards.length; i++) {
        const card = cardDetails[i];
        if (!card) continue;
        entries[i] = `${selectedCards[i].count} ${card.name} (${card.set}) ${card.collector_number}`;
      }
      
      return entries.filter(Boolean).join('\n');
    } catch (error) {
      logger.error('Error in exportText:', error);
      throw error;
    }
  }
  
  static async getCardById(scryfallId) {
    try {
      const cardModel = new Card();
      const query = { scryfall_id: scryfallId };
      const cards = await cardModel.find_by(query, Card.SERIALIZED_FIELDS);
      return cards[0] || null;
    } catch (error) {
      logger.error(`Error fetching card by ID ${scryfallId}:`, error);
      return null;
    }
  }

  // Convert legacy package format to minimal format
  static async exportTextFromPackage(cardPackage) {
    const selectedCards = cardPackage.package_entries
      .filter(entry => !entry.not_found)
      .map(entry => ({
        count: entry.count,
        scryfall_id: entry.selected_print
      }));
      
    return this.exportText(selectedCards);
  }
  
  // Convert legacy package format to minimal format
  static async exportTCGPlayerFromPackage(cardPackage) {
    const selectedCards = cardPackage.package_entries
      .filter(entry => !entry.not_found)
      .map(entry => ({
        count: entry.count,
        scryfall_id: entry.selected_print
      }));
      
    return this.exportTCGPlayer(selectedCards);
  }
}

export default CardPackageExporter;
