import assert from 'assert';
import sinon from 'sinon';
import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import Card from '../../src/models/card.js';
import validCardPackage from '../fixtures/cardPackages/validCardPackage.json';
import randomCardPackage from '../fixtures/cardPackages/randomCardPackage.json';

describe('CardPackageCreator Service', function() {
  let cardFindByStub;
  let mockCollection;

  beforeEach(function() {
    mockCollection = {
      find: function(query) {
        return {
          toArray: async function() {
            if (query.sanitized_name === 'terror') {
              return validCardPackage.package_entries[0].card_prints;
            } else if (query.sanitized_name === 'natural_order') {
              return validCardPackage.package_entries[1].card_prints;
            }
            return [];
          }
        };
      }
    };
    sinon.stub(Card.prototype, 'getCollection').resolves(mockCollection);
    
    cardFindByStub = sinon.stub(Card.prototype, 'find_by');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('perform', function() {
    const cardList = validCardPackage.card_list;
    const game = validCardPackage.game;
    const defaultSelection = validCardPackage.default_selection;

    it('it should return a card package', async function() {
      const terrorPrints = validCardPackage.package_entries[0].card_prints;
      const naturalOrderPrints = validCardPackage.package_entries[1].card_prints;

      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'terror' })).resolves(terrorPrints);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'natural_order' })).resolves(naturalOrderPrints);
      const result = await CardPackageCreator.perform(cardList, game, defaultSelection);

      assert.deepStrictEqual(result.card_list, validCardPackage.card_list);
      assert.deepStrictEqual(result.game, validCardPackage.game);
      assert.deepStrictEqual(result.default_selection, validCardPackage.default_selection);
      
      // Check that we have the expected number of package entries
      assert.strictEqual(result.package_entries.length, validCardPackage.package_entries.length);
      
      // Check that each package entry has the correct structure and data
      result.package_entries.forEach((entry, index) => {
        const expectedEntry = validCardPackage.package_entries[index];
        assert.strictEqual(entry.count, expectedEntry.count);
        assert.strictEqual(entry.name, expectedEntry.name);
        assert.deepStrictEqual(entry.oracle_id, expectedEntry.oracle_id);
        assert.strictEqual(entry.user_selected, expectedEntry.user_selected);
        
        // Check that we have card prints (exact count may vary due to database state)
        assert(entry.card_prints.length > 0, 'Should have at least one card print');
        assert(entry.selected_print, 'Should have a selected print');
      });
    });

    describe('cardPackage caching', function() {
      describe('when the card package is not cached', function() {
        it('should query the card database', async function() {
          // add cache stubbing
        });
      });

      describe('when the card package is cached', function() {
        it('should return the cached card package', async function() {
          // add cache stubbing
        });
      });
    });
  });

  describe('perform_random', function() {
    it('should return a card package with random cards', async function() {
      const echoingCouragePrints = randomCardPackage.package_entries[0].card_prints;
      const clockworkHydraPrints = randomCardPackage.package_entries[1].card_prints;
      const thopterPrints = randomCardPackage.package_entries[2].card_prints;
      
      sinon.stub(Card.prototype, 'find_random').resolves(randomCardPackage.card_list);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'echoing_courage' })).resolves(echoingCouragePrints);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'clockwork_hydra' })).resolves(clockworkHydraPrints);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'thopter' })).resolves(thopterPrints);
      
      const result = await CardPackageCreator.perform_random(3, randomCardPackage.game, randomCardPackage.default_selection);

      assert.deepStrictEqual(result.card_list.length, 3);
      assert.deepStrictEqual(result.game, randomCardPackage.game);
      assert.deepStrictEqual(result.default_selection, randomCardPackage.default_selection);
      
      assert.strictEqual(result.package_entries[0].name, 'Echoing Courage');
      assert.strictEqual(result.package_entries[0].count, 1);
      assert.strictEqual(result.package_entries[0].selected_print, randomCardPackage.package_entries[0].selected_print);
      assert.strictEqual(result.package_entries[0].card_prints.length, echoingCouragePrints.length);
      
      assert.strictEqual(result.package_entries[1].name, 'Clockwork Hydra');
      assert.strictEqual(result.package_entries[1].count, 1);
      assert.strictEqual(result.package_entries[1].selected_print, randomCardPackage.package_entries[1].selected_print);
      assert.strictEqual(result.package_entries[1].card_prints.length, clockworkHydraPrints.length);

      assert.strictEqual(result.package_entries[2].name, 'Thopter');
      assert.strictEqual(result.package_entries[2].count, 1);
      assert.strictEqual(result.package_entries[2].selected_print, randomCardPackage.package_entries[2].selected_print);
      assert.strictEqual(result.package_entries[2].card_prints.length, thopterPrints.length);
    });
  });
});