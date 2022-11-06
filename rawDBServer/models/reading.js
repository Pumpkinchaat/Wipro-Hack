const { Schema, model } = require("mongoose");

const readingSchema = new Schema({
  temperature: Number,
  humidity: Number,
  gasConcentration: Number,
  timeStamp: Date,
  SensorID: Number,
});

module.exports = model("Reading", readingSchema);
