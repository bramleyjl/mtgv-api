import logger from '../lib/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request logging middleware
 * Logs all incoming requests with timing, correlation ID, and response details
 */
export default function requestLogger(req, res, next) {
  // Generate correlation ID for request tracking
  const correlationId = uuidv4();
  req.correlationId = correlationId;

  // Start timer
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming Request', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Capture the original res.json to log the response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - startTime;

    logger.info('Response Sent', {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    return originalJson(body);
  };

  // Log response on finish (even for non-JSON responses)
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Skip if already logged via res.json
    if (res.headersSent && !res.locals.logged) {
      logger.info('Response Completed', {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}
