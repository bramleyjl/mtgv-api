require("dotenv").config();
var express = require("express");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var cors = require("cors");
cors({ credentials: true, origin: true });
var bodyParser = require("body-parser");

var routes = require("./routes/routes");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", routes);

app.use(function (req, res, next) {
  console.info(req.method, req.originalUrl);
});

const port = 4000;
app.listen(port);
console.log(`MtG Versioner listening on port ${port}.`);

module.exports = app;
