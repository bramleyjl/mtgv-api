import app, { initializeApp } from './app.js';
import logger from './lib/logger.js';
import websocketService from './services/websocketService.js';

const port = process.env.PORT || 4000;

initializeApp().then(async () => {
  const server = app.listen(port);
  
  // Initialize WebSocket server
  await websocketService.initialize(server);
  
  logger.info(`MtG Versioner listening on port ${port}.`);
}).catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;