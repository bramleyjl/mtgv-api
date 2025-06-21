import app, { initializeApp } from './app.js';
import logger from './lib/logger.js';

const port = process.env.PORT || 4000;

initializeApp().then(() => {
  app.listen(port);
  logger.info(`MtG Versioner listening on port ${port}.`);
}).catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;