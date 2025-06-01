import 'dotenv/config';

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/routes.js";
import { handleRouteNotFound } from './middleware/errorHandler.js';
import errorHandler from './middleware/errorHandler.js';
import { initializeDatabase } from "./db/initializer.js";
import compression from 'compression';

const app = express();

cors({ credentials: true, origin: true });
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(compression());

initializeDatabase().catch(err => {
  logger.error('Failed to initialize database. Exiting.', err);
  process.exit(1);
});

app.use('/', router);
app.use('*', handleRouteNotFound);
app.use(errorHandler);

export default app;
