import assert from 'assert';
import sinon from 'sinon';
import {
  validateGameTypes,
  validateCardList,
  validateCardCount,
  validateDefaultSelection,
  validateExportType,
  validateSearchQuery,
} from '../../src/middleware/validateParams.js';
import { ValidationError } from '../../src/lib/errors.js';

describe('validateParams.js', function() {
  let mockReq;
  let mockRes;
  let nextSpy;

  beforeEach(function() {
    mockReq = { query: {}, body: {} };
    mockRes = {}; // Not really used by these middlewares
    nextSpy = sinon.spy();
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('validateGameTypes (middleware)', function() {
    it('should set req.validatedGame and call next for valid game type', function() {
      mockReq.query.game = 'mtgo';
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedGame, 'mtgo');
    });

    it('should set req.validatedGame to paper and call next if no game provided', function() {
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedGame, 'paper');
    });

    it('should call next with ValidationError if invalid game provided', function() {
      mockReq.query.game = 'invalid_game';
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Invalid "game" provided.');
      assert.deepStrictEqual(error.details, { provided: 'invalid_game' });
    });
  });

  describe('validateCardList (middleware)', function() {
    it('should set req.validatedCardList and call next for a valid card list', function() {
      const validList = [{ name: 'Test Card', count: 1 }];
      mockReq.body.card_list = validList;
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedCardList, [
        { 
          name: 'Test Card', 
          count: 1
        }
      ]);
    });

    it('should trim whitespace from card names', function() {
      const validList = [{ name: '  Test Card  ', count: 1 }];
      mockReq.body.card_list = validList;
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedCardList, [
        { 
          name: 'Test Card', 
          count: 1
        }
      ]);
    });

    it('should call next with ValidationError for an invalid card list (e.g., empty array)', function() {
      mockReq.body.card_list = [];
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"card_list" must be a non-empty array.');
      assert.deepStrictEqual(error.details, { provided: [] });
    });

    it('should call next with ValidationError if card name is invalid', function() {
      mockReq.body.card_list = [{ name: '', count: 1 }];
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Every card in "card_list" must have a valid, non-empty name. Provided: ');
    });

    it('should call next with ValidationError if total card count exceeds 100', function() {
      // Create a list of 101 unique cards
      const overLimitList = Array.from({ length: 101 }, (_, i) => ({ name: `Card ${i+1}`, count: 1 }));
      mockReq.body.card_list = overLimitList;
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Total cards (101) exceeds the limit of 100 cards.');
    });

    it('should call next with ValidationError if card name does not contain any letters', function() {
      mockReq.body.card_list = [{ name: '123!!!', count: 1 }];
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Every card in "card_list" must have at least one letter in its name. Provided: 123!!!');
    });
  });

  describe('validateCardCount (middleware)', function() {
    it('should set req.validatedCount and call next for a valid count', function() {
      mockReq.query.count = '5';
      validateCardCount(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedCount, 5);
    });

    it('should call next with ValidationError for non-integer count', function() {
      mockReq.query.count = 'abc';
      validateCardCount(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Count must be a positive integer');
      assert.deepStrictEqual(error.details, { provided: 'abc' });
    });

    it('should call next with ValidationError for zero count', function() {
      mockReq.query.count = '0';
      validateCardCount(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Count must be a positive integer');
      assert.deepStrictEqual(error.details, { provided: '0' });
    });

    it('should call next with ValidationError for negative count', function() {
      mockReq.query.count = '-1';
      validateCardCount(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Count must be a positive integer');
      assert.deepStrictEqual(error.details, { provided: '-1' });
    });
  });

  describe('validateDefaultSelection (middleware)', function() {
    const DEFAULT_SELECTION_OPTIONS = ['oldest', 'newest', 'most_expensive', 'least_expensive'];
    
    it('should set req.validatedDefaultSelection to provided valid value and call next', function() {
      mockReq.query.defaultSelection = 'oldest';
      validateDefaultSelection(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedDefaultSelection, 'oldest');
    });

    it('should default to "newest" if no defaultSelection is provided and call next', function() {
      validateDefaultSelection(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedDefaultSelection, 'newest');
    });

    it('should call next with ValidationError for an invalid defaultSelection', function() {
      mockReq.query.defaultSelection = 'invalid_option';
      validateDefaultSelection(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Invalid "defaultSelection" provided.');
      assert.deepStrictEqual(error.details, {
        allowed: DEFAULT_SELECTION_OPTIONS,
        provided: 'invalid_option'
      });
    });
  });

  describe('validateExportType (middleware)', function() {
    const EXPORT_TYPES = ['tcgplayer', 'text'];

    it('should set req.validatedExportType to provided valid value and call next', function() {
      mockReq.query.type = 'tcgplayer';
      validateExportType(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedExportType, 'tcgplayer');
    });

    it('should default to "text" if no type is provided and call next', function() {
      validateExportType(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedExportType, 'text');
    });

    it('should call next with ValidationError for an invalid type', function() {
      mockReq.query.type = 'invalid_type';
      validateExportType(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Invalid export type.');
      assert.deepStrictEqual(error.details, {
        allowed: EXPORT_TYPES,
        provided: 'invalid_type'
      });
    });
  });

  describe('validateSearchQuery (middleware)', function() {
    it('should set req.validatedQuery and call next for a valid query', function() {
      mockReq.query.query = 'lightning';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'lightning');
    });

    it('should trim whitespace from valid query', function() {
      mockReq.query.query = '  lightning  ';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'lightning');
    });

    it('should accept query with special characters', function() {
      mockReq.query.query = 'lightning-bolt!';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'lightning-bolt!');
    });

    it('should accept query with numbers', function() {
      mockReq.query.query = 'lightning123';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'lightning123');
    });

    it('should accept minimum length query (2 characters)', function() {
      mockReq.query.query = 'ab';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'ab');
    });

    it('should accept query with spaces', function() {
      mockReq.query.query = 'lightning bolt';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.strictEqual(mockReq.validatedQuery, 'lightning bolt');
    });

    it('should call next with ValidationError for missing query', function() {
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"query" must be a non-empty string.');
      assert.strictEqual(error.details.provided, undefined);
    });

    it('should call next with ValidationError for empty string query', function() {
      mockReq.query.query = '';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"query" must be a non-empty string.');
      assert.strictEqual(error.details.provided, '');
    });

    it('should call next with ValidationError for whitespace-only query', function() {
      mockReq.query.query = '   ';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"query" must be a non-empty string.');
      assert.strictEqual(error.details.provided, '   ');
    });

    it('should call next with ValidationError for query shorter than 2 characters', function() {
      mockReq.query.query = 'a';
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"query" must be at least 2 characters long.');
      assert.strictEqual(error.details.provided, 'a');
    });

    it('should call next with ValidationError for non-string query', function() {
      mockReq.query.query = 123;
      validateSearchQuery(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '"query" must be a non-empty string.');
      assert.strictEqual(error.details.provided, 123);
    });
  });
});