import logger from '../lib/logger.js';
import { AppError, RouteNotFoundError } from '../lib/errors.js';

// eslint-disable-next-line no-unused-vars
export function handleRouteNotFound(req, res, _next) {
  const env = process.env.NODE_ENV;
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

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
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