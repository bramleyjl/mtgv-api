import assert from 'assert';
import sinon from 'sinon';
import errorHandler, { handleRouteNotFound } from '../../src/middleware/errorHandler.js';
import { AppError, RouteNotFoundError, ValidationError } from '../../src/lib/errors.js';
import logger from '../../src/lib/logger.js';

describe('errorHandler.js', function() {
  let mockReq, mockRes, mockNext, statusStub, jsonStub, loggerErrorStub;

  beforeEach(function() {
    mockReq = { originalUrl: '/notfound' };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    mockRes = { status: statusStub };
    mockNext = sinon.stub();
    loggerErrorStub = sinon.stub(logger, 'error');
  });

  afterEach(function() {
    loggerErrorStub.restore();
    sinon.restore();
  });

  describe('handleRouteNotFound', function() {
    it('should return a 404 error with the correct JSON payload', function() {
      process.env.ENVIRONMENT = 'test';
      const env = process.env.ENVIRONMENT;
      const response = handleRouteNotFound(mockReq, mockRes, mockNext);
      
      assert(statusStub.calledOnceWith(404));
      assert(jsonStub.calledOnceWith({
        error: {
          name: 'RouteNotFoundError',
          status: 404,
          message: 'Invalid Request',
          env: env
        },
        message: "Requested route '/notfound' does not exist"
      }));
    });
  });

  describe('errorHandler', function() {
    it('should handle AppError instances correctly', function() {
      const err = new AppError('Test AppError', 400, { detail: 'some detail' });
      errorHandler(err, mockReq, mockRes, mockNext);

      assert(loggerErrorStub.calledOnceWith(err));
      assert(statusStub.calledOnceWith(400));
      assert(jsonStub.calledOnceWith({
        error: 'Test AppError',
        details: { detail: 'some detail' },
        type: 'AppError'
      }));
    });

    it('should handle ValidationError instances correctly (as it is an AppError)', function() {
      const err = new ValidationError('Test ValidationError', { field: 'testField' });
      errorHandler(err, mockReq, mockRes, mockNext);

      assert(loggerErrorStub.calledOnceWith(err));
      assert(statusStub.calledOnceWith(400)); // Default for ValidationError
      assert(jsonStub.calledOnceWith({
        error: 'Test ValidationError',
        details: { field: 'testField' },
        type: 'ValidationError'
      }));
    });

    it('should handle SyntaxError related to JSON parsing', function() {
      const err = new SyntaxError('Unexpected token i in JSON at position 0');
      // err.name is 'SyntaxError' by default for SyntaxError
      errorHandler(err, mockReq, mockRes, mockNext);

      assert(loggerErrorStub.calledOnceWith(err));
      assert(statusStub.calledOnceWith(400));
      assert(jsonStub.calledOnceWith({
        error: 'Invalid JSON',
        type: 'SyntaxError'
      }));
    });

    it('should handle generic Errors with a 500 status', function() {
      const err = new Error('Generic test error');
      errorHandler(err, mockReq, mockRes, mockNext);

      assert(loggerErrorStub.calledOnceWith(err));
      assert(statusStub.calledOnceWith(500));
      assert(jsonStub.calledOnceWith({
        error: 'Internal server error',
        type: 'Error'
      }));
    });
    
    it('should handle generic Errors without a name property with a 500 status and default type', function() {
      const err = { message: 'Error without name' }; // Not an instance of Error, no 'name'
      errorHandler(err, mockReq, mockRes, mockNext);

      assert(loggerErrorStub.calledOnceWith(err));
      assert(statusStub.calledOnceWith(500));
      assert(jsonStub.calledOnceWith({
        error: 'Internal server error',
        type: 'Error'
      }));
    });
  });
});