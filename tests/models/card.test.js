import assert from 'assert';
import { Decimal128 } from 'mongodb';
import Card from '../../src/models/card.js';
import * as helper from '../../src/lib/helper.js';
import scryfallCard from '../fixtures/scryfall_cards/scryfall_card.json';
import scryfallMdfc from '../fixtures/scryfall_cards/scryfall_mdfc.json';

describe('Card Model - serialize_for_db', function() {
  let cardInstance;

  beforeEach(function() {
    cardInstance = new Card();
  });

  it('should return undefined if card has content_warning', function() {
    const card = { ...scryfallCard, content_warning: true };
    const result = cardInstance.serialize_for_db(card);
    assert.strictEqual(result, undefined);
  });

  it('should correctly serialize a single-faced card', function() {
    const result = cardInstance.serialize_for_db(scryfallCard);

    assert.deepStrictEqual(result, {
      scryfall_id: scryfallCard.id,
      oracle_id: scryfallCard.oracle_id,
      tcgplayer_id: scryfallCard.tcgplayer_id,
      cardmarket_id: scryfallCard.cardmarket_id,
      mtgo_id: scryfallCard.mtgo_id,
      mtgo_foil_id: scryfallCard.mtgo_foil_id,
      arena_id: scryfallCard.arena_id,
      layout: scryfallCard.layout,
      name: scryfallCard.name,
      sanitized_name: helper.sanitizeCardName(scryfallCard.name),
      games: scryfallCard.games,
      set: scryfallCard.set.toUpperCase(),
      set_name: scryfallCard.set_name,
      collector_number: scryfallCard.collector_number,
      image_uris: [scryfallCard.image_uris],
      released_at: scryfallCard.released_at,
      prices: {
        usd: Decimal128.fromString(scryfallCard.prices.usd),
        usd_foil: null,
        usd_etched: null,
        eur: Decimal128.fromString(scryfallCard.prices.eur),
        eur_foil: null,
        tix: null
      },
      border_color: scryfallCard.border_color,
      finishes: scryfallCard.finishes
    });
  });

  it('should correctly serialize a multi-faced card (modal_dfc)', function() {
    const result = cardInstance.serialize_for_db(scryfallMdfc);
    console.log(result);
    assert.deepStrictEqual(result.oracle_id, scryfallMdfc.oracle_id);
    assert.deepStrictEqual(result.image_uris, [scryfallMdfc.card_faces[0].image_uris, scryfallMdfc.card_faces[1].image_uris]);
    assert.strictEqual(result.name, scryfallMdfc.name);
    assert.strictEqual(result.set, scryfallMdfc.set.toUpperCase());
    assert.strictEqual(result.sanitized_name, helper.sanitizeCardName(scryfallMdfc.name));
  });

  describe('price conversion', function() {
    it('should handle null prices', function() {
      const card = { ...scryfallCard, prices: null };
      const result = cardInstance.serialize_for_db(card);
      assert.strictEqual(result.prices, null);
    });

    it('should handle undefined prices', function() {
      const card = { ...scryfallCard, prices: undefined };
      const result = cardInstance.serialize_for_db(card);
      assert.strictEqual(result.prices, undefined);
    });

    it('should convert string prices to Decimal128', function() {
      const card = {
        ...scryfallCard,
        prices: {
          usd: '10.99',
          eur: '8.50',
          tix: null
        }
      };
      const result = cardInstance.serialize_for_db(card);
      
      assert(result.prices.usd instanceof Decimal128);
      assert.strictEqual(result.prices.usd.toString(), '10.99');
      assert(result.prices.eur instanceof Decimal128);
      assert.strictEqual(result.prices.eur.toString(), '8.50');
      assert.strictEqual(result.prices.tix, null);
    });

    it('should handle empty prices object', function() {
      const card = { ...scryfallCard, prices: {} };
      const result = cardInstance.serialize_for_db(card);
      assert.deepStrictEqual(result.prices, {});
    });
  });
});