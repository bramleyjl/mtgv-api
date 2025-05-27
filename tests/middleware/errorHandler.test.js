// __tests__/middleware/errorHandler.test.js
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { ValidationError, NotFoundError } from '../../src/lib/errors.js';

describe('Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid input',
      details: { field: 'name' },
      type: 'ValidationError'
    });
  });
  
  // More tests for other error types
});