import app from './app.js';
import logger from './lib/logger.js';

const port = process.env.PORT || 4000;
const server = app.listen(port);
logger.info(`MtG Versioner listening on port ${port}.`);

export default server;