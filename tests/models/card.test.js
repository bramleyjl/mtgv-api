import assert from 'assert';
import { Decimal128 } from 'mongodb';
import Card from '../../src/models/card.js';
import * as helper from '../../src/lib/helper.js';
import scryfallCard from '../fixtures/scryfall_cards/scryfall_card.json';
import scryfallMdfc from '../fixtures/scryfall_cards/scryfall_mdfc.json';
import sinon from 'sinon';
import logger from '../../src/lib/logger.js';
import { DatabaseError } from '../../src/lib/errors.js';

describe('serialize_for_db', function() {
  let cardInstance;

  beforeEach(function() {
    cardInstance = new Card();
  });

  it('should return undefined if card has a content_warning', function() {
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
    assert.strictEqual(result.oracle_id, scryfallMdfc.oracle_id);
    assert.strictEqual(result.name, scryfallMdfc.name);
    assert.strictEqual(result.set, scryfallMdfc.set.toUpperCase());
    assert.deepStrictEqual(result.image_uris, [scryfallMdfc.card_faces[0].image_uris, scryfallMdfc.card_faces[1].image_uris]);
  });

  describe('price conversion', function() {
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

describe('find_random', function() {
  let cardInstance;
  let mockCollection;

  beforeEach(function() {
    cardInstance = new Card();
    mockCollection = {
      aggregate: function() {
        return {
          [Symbol.asyncIterator]: async function* () {
            yield { name: scryfallCard.name };
            yield { name: scryfallMdfc.name };
          }
        };
      }
    };
    sinon.stub(cardInstance, 'getCollection').resolves(mockCollection);
  });

  afterEach(function() {
    sinon.restore();
  });

  it('should return random cards excluding basic lands', async function() {
    const result = await cardInstance.find_random(2, ['paper']);
    
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result, [
      { name: scryfallCard.name, count: 1 },
      { name: scryfallMdfc.name, count: 1 }
    ]);
  });
});

describe('writeCollection', function() {
  let cardInstance;
  let mockCollection;

  beforeEach(function() {
    cardInstance = new Card();
    mockCollection = {
      deleteMany: sinon.stub().resolves({ deletedCount: 5 }),
      insertMany: sinon.stub().resolves({ insertedCount: 2 })
    };
    sinon.stub(cardInstance, 'getCollection').resolves(mockCollection);
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
  });

  afterEach(function() {
    sinon.restore();
  });

  it('should clear and write collection data successfully', async function() {
    const testData = [
      cardInstance.serialize_for_db(scryfallCard),
      cardInstance.serialize_for_db(scryfallMdfc)
    ];

    const result = await cardInstance.writeCollection(testData);

    assert.strictEqual(result, true);
    assert(mockCollection.deleteMany.calledOnce);
    assert(mockCollection.insertMany.calledOnceWith(testData));
    assert(logger.info.calledWith('Clearing the card data collection...'));
    assert(logger.info.calledWith('Deleted 5 entries.'));
    assert(logger.info.calledWith('Inserted 2 entries.'));
  });

  it('should handle database errors', async function() {
    const error = new Error('Database error');
    mockCollection.deleteMany.rejects(error);

    await assert.rejects(
      cardInstance.writeCollection([]),
      function(err) {
        assert(err instanceof DatabaseError);
        assert.strictEqual(err.message, 'Database error during writeCollection');
        return true;
      }
    );
    assert(logger.error.calledWith('Error writing collection data:', error));
  });
});