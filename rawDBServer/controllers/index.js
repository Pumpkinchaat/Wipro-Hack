const Reading = require("../models/reading");

const catchAsync = require("../utils/catchAsync");

// this will be used by the sensors to send data to the Raw DB
module.exports.postSensorData = catchAsync(async (req, res, next) => {
  const { temperature, humidity, gasConcentration, timeStamp, SensorID } =
    req.query;
    // !query also possible 

  const newReading = new Reading({
    temperature,
    humidity,
    gasConcentration,
    timeStamp,
    SensorID,
  });

  await newReading.save();

  res.status(201).json({
    status: "success",
    reqTime: req.requestTime,
    data: {
      newReading,
    },
  });
});

// this will be used by the Knowledge Engine to get data from the Raw DB
module.exports.getSensorData = catchAsync(async (req, res, next) => {
  const { hours, SensorID } = req.params;

  const queryDate = new Date(new Date(Date.now()) - hours * 60 * 60 * 1000);

  const readings = await Reading.find({
    timeStamp: {
      $gte: queryDate,
    },
    SensorID,
  });

  res.status(200).json({
    status: "success",
    results: readings.length,
    reqTime: req.requestTime,
    data: {
      readings,
    },
  });
});
