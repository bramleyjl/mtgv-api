import assert from 'assert';
import sinon from 'sinon';
import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import Card from '../../src/models/card.js';
import logger from '../../src/lib/logger.js';
import * as helper from '../../src/lib/helper.js';
import { AppError } from '../../src/lib/errors.js';
import validCardPackage from '../fixtures/cardPackages/validCardPackage.json' assert { type: 'json' };

describe('CardPackageCreator Service', function() {
  let cardFindByStub;
  let loggerInfoStub;
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
    loggerInfoStub = sinon.stub(logger, 'info');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('perform', function() {
    const cardList = validCardPackage.cardList;
    const games = validCardPackage.games;
    const defaultSelection = validCardPackage.default_selection;
    const packageKey = `package:${cardList.map(entry => entry.name).join(',')}:${games.sort().join(',')}:${defaultSelection}`;

    describe('cardPackage caching', function() {
      describe('when the card package is not cached', function() {
        it('should cache the card package', async function() {          
          const terrorPrints = validCardPackage.package_entries[0].card_prints;
          const naturalOrderPrints = validCardPackage.package_entries[1].card_prints;
          cardFindByStub.withArgs(sinon.match({ sanitized_name: 'terror' })).resolves(terrorPrints);
          cardFindByStub.withArgs(sinon.match({ sanitized_name: 'natural_order' })).resolves(naturalOrderPrints);
          const result = await CardPackageCreator.perform(cardList, games, defaultSelection);

          assert.deepStrictEqual(result.cardList, validCardPackage.cardList);
          assert.deepStrictEqual(result.games, validCardPackage.games);
          assert.deepStrictEqual(result.default_selection, validCardPackage.default_selection);
          assert.deepStrictEqual(result.package_entries[0].card_prints, validCardPackage.package_entries[0].card_prints);
          assert.deepStrictEqual(result.package_entries[0].selected_print, validCardPackage.package_entries[0].selected_print);
          assert.deepStrictEqual(result.package_entries[1].card_prints, validCardPackage.package_entries[1].card_prints);
          assert.deepStrictEqual(result.package_entries[1].selected_print, validCardPackage.package_entries[1].selected_print);
        });
      });

      describe('when the card package is cached', function() {
        it('should return the cached card package', async function() {

        });
      });
    });

    // describe('error handling', function() {
    //   it('should handle database errors', async function() {
    //     const error = new Error('Database error');
    //     cardFindByStub.rejects(error);

    //     await assert.rejects(
    //       async () => {
    //         await CardPackageCreator.perform(cardList, games, defaultSelection);
    //       },
    //       function(err) {
    //         assert(err instanceof AppError);
    //         assert.strictEqual(err.message, 'Failed to create card package: Database error');
    //         return true;
    //       }
    //     );
    //   });
    // });
  });
});