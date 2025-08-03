const express = require("express");
const router = express.Router();
const { sendBookingConfirmation } = require("../controllers/bookingController");

// router.post("/send-confirmation", sendBookingConfirmation);

module.exports = router;
