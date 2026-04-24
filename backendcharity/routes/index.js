const express = require("express");
const router = express.Router();

const authRoutes     = require("./authRoutes");
const charityRoutes  = require("./charityRoutes");
const donationRoutes = require("./donationRoutes");
const requestRoutes  = require("./requestRoutes");

router.use("/auth",      authRoutes);
router.use("/charities", charityRoutes);
router.use("/donations", donationRoutes);
router.use("/requests",  requestRoutes);

module.exports = router;
