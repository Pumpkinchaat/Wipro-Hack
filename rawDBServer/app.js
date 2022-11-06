const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");

const app = express();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/globalErrorController");

const ReadingRouter = require("./routes/index");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//parse raw data
app.use(bodyParser.raw({ inflate: true, limit: "500kb", type: "text/xml" }));

// creating middleware
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // to enable logging
}

// for preventing DoS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

// for security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // to make sure next middleware gets executed
});

//All the routes go here

app.use("/api", ReadingRouter);

// if the above routes don't get triggered, we can fire another middleware
// for catching errors
app.all("*", (req, res, next) => {
  //global error handler
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

// server
module.exports = app;
