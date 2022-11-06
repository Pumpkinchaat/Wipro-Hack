const express = require("express");
const router = express.Router();
const { postSensorData, getSensorData } = require("../controllers/index");

router.route("/").post(postSensorData);

router.route("/:hours/:SensorID").get(getSensorData);

module.exports = router;
