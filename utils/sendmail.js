const sendBookingEmail = async (to, booking) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,  // Admin email (sender)
    to: to,                        // Recipient (user's email)
    subject: "Train Booking Confirmation",
    html: `
      <h2>Booking Confirmed ✅</h2>
      <p><strong>Train:</strong> ${booking.train}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Coach:</strong> ${booking.coach} ${booking.coachNumber}</p>
      <p><strong>Seat:</strong> ${booking.seat}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
