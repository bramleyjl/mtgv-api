import logger from '../lib/logger.js';
import { AppError, RouteNotFoundError } from '../lib/errors.js';

export function handleRouteNotFound(req, res, next) { // eslint-disable-line no-unused-vars
  const env = process.env.ENVIRONMENT;
  const error = new RouteNotFoundError(req.originalUrl);

  return res.status(error.statusCode).json({
    error: { 
      name: error.name, 
      status: error.statusCode, 
      message: 'Invalid Request', 
      env 
    },
    message: error.message
  });
}

export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(err);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      type: err.name
    });
  }
  
  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    return res.status(400).json({
      error: 'Invalid JSON',
      type: 'SyntaxError'
    });
  }
  
  return res.status(500).json({
    error: 'Internal server error',
    type: err.name || 'Error'
  });
}