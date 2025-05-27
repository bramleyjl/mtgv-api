// __tests__/middleware/validateParams.test.js
import { validateGameTypes, validateCardList, validateDefaultSelection } from '../../src/middleware/validateParams.js';
import { expect, describe, it, beforeEach, jest } from '@jest/globals';

describe('Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateGameTypes', () => {
    it('should set default game type if none provided', () => {
      validateGameTypes(req, res, next);
      expect(req.validatedGames).toEqual(['paper']);
      expect(next).toHaveBeenCalled();
    });

    it('should validate and accept valid game types', () => {
      req.query.games = ['paper', 'mtgo'];
      validateGameTypes(req, res, next);
      expect(req.validatedGames).toEqual(['paper', 'mtgo']);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid game types', () => {
      req.query.games = ['invalid_game'];
      validateGameTypes(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Similar tests for other validation middleware
});