const Model = require('./model')
const helper = require('../helpers/helper');

class Card extends Model {
  constructor() {
    super('cards');
  }

  serialize(card) {
    if (card.content_warning) { return undefined }

    return {
      scryfall_id: card.id,
      oracle_id: card.card_faces != null ? [card.card_faces[0].oracle_id, card.card_faces[1].oracle_id] : [card.oracle_id],
      tcgplayer_id: card.tcgplayer_id,
      cardmarket_id: card.cardmarket_id,
      mtgo_id: card.mtgo_id,
      mtgo_foil_id: card.mtgo_foil_id,
      arena_id: card.arena_id,
      layout: card.layout,
      name: card.name,
      sanitized_name: helper.sanitizeCardName(card.name),
      games: card.games,
      set: card.set.toUpperCase(),
      set_name: card.set_name,
      collector_number: card.collector_number,
      image_uris: card.card_faces != null ? [card.card_faces[0].image_uris, card.card_faces[1].image_uris] : [card.image_uris],
      released_at: card.released_at,
      prices: card.prices,
      border_color: card.border_color,
      finishes: card.finishes
    }
  }

  async find_random(cardListCount) {
    const basicLands = ['Mountain', 'Island', 'Plains', 'Swamp', 'Forest'];
    const collection = await this.getCollection();
    const pipeline = [
      { $match: { name: { $not: { $in: basicLands } } } },
      { $sample: { size: cardListCount } },
    ];
    const randomCards = [];
    for await (const doc of collection.aggregate(pipeline)) {
      randomCards.push({ name: doc.name, count: 1 });
    }
    return randomCards;
  }

  async writeCollection(data) {
    const collection = await this.getCollection();
    console.log('Clearing the card data collection...');
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} entries.`);
  
    const insertResult = await collection.insertMany(data);
    console.log(`Inserted ${insertResult.insertedCount} entries.`);
    await Card.closeConnection();
    return collection;
  }
}

module.exports = Card;