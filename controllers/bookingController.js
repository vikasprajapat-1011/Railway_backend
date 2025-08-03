const sendBookingEmail = require("../utils/sendMail");

const sendBookingConfirmation = async (req, res) => {
  const { email, booking } = req.body;

  if (!email || !booking) {
    return res.status(400).json({ message: "Email and booking data are required." });
  }

  try {
    await sendBookingEmail(email, booking);
    res.status(200).json({ message: "Booking email sent successfully." });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Email sending failed." });
  }
};

module.exports = { sendBookingConfirmation };
