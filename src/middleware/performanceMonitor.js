import logger from '../lib/logger.js';

/**
 * Performance monitoring middleware
 * Tracks response times and database query performance
 */

// Store performance metrics in memory (in production, send to monitoring service)
const metrics = {
  requestCounts: new Map(),
  responseTimes: [],
  errors: [],
  slowQueries: [],
};

// Configuration
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const MAX_METRICS_SIZE = 1000; // Keep last 1000 entries

export default function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  const route = `${req.method} ${req.route?.path || req.path}`;

  // Track request count
  const count = metrics.requestCounts.get(route) || 0;
  metrics.requestCounts.set(route, count + 1);

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Record response time
    const metricEntry = {
      route,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    };

    metrics.responseTimes.push(metricEntry);

    // Keep array size manageable
    if (metrics.responseTimes.length > MAX_METRICS_SIZE) {
      metrics.responseTimes.shift();
    }

    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        route,
        duration: `${duration}ms`,
        correlationId: req.correlationId,
      });

      metrics.slowQueries.push(metricEntry);
      if (metrics.slowQueries.length > 100) {
        metrics.slowQueries.shift();
      }
    }

    // Log errors
    if (res.statusCode >= 400) {
      metrics.errors.push(metricEntry);
      if (metrics.errors.length > 100) {
        metrics.errors.shift();
      }
    }
  });

  next();
}

/**
 * Get current performance metrics
 */
export function getMetrics() {
  const now = Date.now();
  const last15Min = now - 15 * 60 * 1000;

  // Filter metrics from last 15 minutes
  const recentMetrics = metrics.responseTimes.filter(
    m => new Date(m.timestamp).getTime() > last15Min
  );

  // Calculate statistics
  const responseTimes = recentMetrics.map(m => m.duration);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const p95ResponseTime = sortedTimes.length > 0
    ? sortedTimes[Math.floor(sortedTimes.length * 0.95)]
    : 0;

  const p99ResponseTime = sortedTimes.length > 0
    ? sortedTimes[Math.floor(sortedTimes.length * 0.99)]
    : 0;

  // Count requests by status code
  const statusCodes = {};
  recentMetrics.forEach(m => {
    const code = Math.floor(m.statusCode / 100) * 100;
    statusCodes[code] = (statusCodes[code] || 0) + 1;
  });

  // Get top routes by request count
  const routeCounts = Array.from(metrics.requestCounts.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    timeWindow: '15 minutes',
    totalRequests: recentMetrics.length,
    avgResponseTime: Math.round(avgResponseTime),
    p95ResponseTime: Math.round(p95ResponseTime),
    p99ResponseTime: Math.round(p99ResponseTime),
    statusCodes,
    topRoutes: routeCounts,
    slowRequests: metrics.slowQueries.slice(-10),
    recentErrors: metrics.errors.slice(-10),
  };
}

/**
 * Clear metrics (useful for testing)
 */
export function clearMetrics() {
  metrics.requestCounts.clear();
  metrics.responseTimes = [];
  metrics.errors = [];
  metrics.slowQueries = [];
}
