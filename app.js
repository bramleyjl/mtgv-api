require("dotenv").config();

const port = process.env.PORT;
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./routes/api_routes");
const app = express();

cors({ credentials: true, origin: true });
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// routing
app.use('/api', router);
app.get('/', function (req, res) { res.send('Welcome to the MTGVersioner API') });
app.use('*', function(req, res) {
  // invalid request handling
  res.json({
    error: { 'name':'Error',
             'status':404,
             'message':'Invalid Request',
             'statusCode':404,
             'stack':`http://localhost:${port}` },
    message: `Requested route '${req.originalUrl}' does not exist`
  });
});
app.listen(port);
console.log(`MtG Versioner listening on port ${port}.`);

module.exports = app;
