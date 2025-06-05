import assert from 'assert';
import sinon from 'sinon';
import {
  validateGameTypes,
  validateCardList,
  validateCardCount,
  validateDefaultSelection,
  validateExportType,
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
    it('should set req.validatedGames and call next for valid game types string', function() {
      mockReq.query.games = 'mtgo';
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedGames, ['mtgo']);
    });

    it('should set req.validatedGames and call next for valid game types array', function() {
      mockReq.query.games = ['paper', 'arena'];
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedGames, ['paper', 'arena']);
    });

    it('should default to [\"paper\"] if no games provided and call next', function() {
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedGames, ['paper']);
    });

    it('should call next with ValidationError if games are provided but all are invalid', function() {
      mockReq.query.games = ['invalid1', 'invalid2'];
      validateGameTypes(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Invalid \"game\" provided.');
      assert.deepStrictEqual(error.details, { provided: ['invalid1', 'invalid2'] });
    });
  });

  describe('validateCardList (middleware)', function() {
    it('should set req.validatedCardList and call next for a valid card list', function() {
      const validList = [{ name: 'Test Card', count: 1 }];
      mockReq.body.card_list = validList;
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnceWithExactly());
      assert.deepStrictEqual(mockReq.validatedCardList, validList);
    });

    it('should call next with ValidationError for an invalid card list (e.g., empty array)', function() {
      mockReq.body.card_list = [];
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, '\"card_list\" must be a non-empty array.');
      assert.deepStrictEqual(error.details, { provided: [] });
    });

    it('should call next with ValidationError if card name is invalid', function() {
      mockReq.body.card_list = [{ name: '', count: 1 }];
      validateCardList(mockReq, mockRes, nextSpy);
      assert(nextSpy.calledOnce);
      const error = nextSpy.firstCall.args[0];
      assert(error instanceof ValidationError);
      assert.strictEqual(error.message, 'Every card in \"card_list\" must have a valid, non-empty name. Provided: ');
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

    it('should default to \"newest\" if no defaultSelection is provided and call next', function() {
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
      assert.strictEqual(error.message, 'Invalid \"defaultSelection\" provided.');
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

    it('should default to \"text\" if no type is provided and call next', function() {
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
});