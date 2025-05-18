import 'dotenv/config';

const port = process.env.PORT || 4000;
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/routes.js";
import database from "./db/database.js";
import logger from "./lib/logger.js";
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

// initialize DB connection
database.connect().catch(err => {
  logger.error('Failed to establish database connection. Exiting.', err);
  process.exit(1);
});

// routing
app.use('/', router);
app.use('*', function(req, res) {
  // invalid request handling
  const name = 'Error';
  const status = 404;
  const message = 'Invalid Request';
  const env = process.env.ENVIRONMENT;
  res.json({
    error: { name, status, message, env },
    message: `Requested route '${req.originalUrl}' does not exist`
  });
});
app.listen(port);
logger.info(`MtG Versioner listening on port ${port}.`);

export default app;
