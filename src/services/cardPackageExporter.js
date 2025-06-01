import Card from "../models/card.js";
import NodeCache from 'node-cache';
import logger from "../lib/logger.js";

const cardByScryfallIdCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

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
      const lines = [];
      
      const cardDetails = await Promise.all(
        selectedCards.map(card => this.getCardById(card.scryfall_id))
      );
      
      for (let i = 0; i < selectedCards.length; i++) {
        const card = cardDetails[i];
        if (!card) continue;
        lines.push(`${selectedCards[i].count} ${card.name} ${card.set} ${card.collector_number}`);
      }
      return lines.join('\n');
    } catch (error) {
      logger.error('Error in exportText:', error);
      throw error;
    }
  }
  
  static async getCardById(scryfallId) {
    const cached = cardByScryfallIdCache.get(scryfallId);
    if (cached) return cached;
    
    try {
      const cardModel = new Card();
      let card = await cardModel.find_by({ scryfall_id: scryfallId }, Card.SERIALIZED_FIELDS);
      card = card[0];

      cardByScryfallIdCache.set(scryfallId, card);
      return card;
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
