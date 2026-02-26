import 'dotenv/config';

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import logger from './lib/logger.js';
import router from "./routes/routes.js";
import { handleRouteNotFound } from './middleware/errorHandler.js';
import errorHandler from './middleware/errorHandler.js';
import { initializeDatabase } from "./db/initializer.js";
import compression from 'compression';
import requestLogger from './middleware/requestLogger.js';
import performanceMonitor, { getMetrics } from './middleware/performanceMonitor.js';
import { securityHeaders, getCorsOptions } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security headers (should be first)
app.use(securityHeaders);

// Compression
app.use(compression());

// CORS with proper configuration
app.use(cors(getCorsOptions()));

// Body parsing
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging (before routes)
app.use(requestLogger);

// Performance monitoring (before routes)
app.use(performanceMonitor);

// General rate limiting (apply to all routes)
app.use(generalLimiter);

export async function initializeApp() {
  try {
    await initializeDatabase();
    logger.info('Application initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database. Exiting.', err);
    process.exit(1);
  }
}

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.use('/', router);
app.use('*', handleRouteNotFound);
app.use(errorHandler);

export default app;
