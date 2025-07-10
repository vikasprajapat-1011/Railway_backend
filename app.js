// ✅ Load .env and dependencies
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require("nodemailer");

// ✅ Import Routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Railway_Management';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Models
const bookingSchema = new mongoose.Schema({
  email: String,
  train: String,
  date: String,
  time: String,
  coach: String,
  coachNumber: String,
  seat: String,
});
const Booking = mongoose.model('Booking', bookingSchema);

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Contact = mongoose.model('Contact', contactSchema);

const trainSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  time: String,
});
const Train = mongoose.model('Train', trainSchema);

// ✅ Email utility for booking confirmation
const sendBookingEmail = async (to, booking) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
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

// ✅ Use Auth Routes
app.use('/api/auth', authRoutes);

// ✅ Contact route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ msg: "Feedback saved successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ msg: "Error saving feedback" });
  }
});

// ✅ Train routes
app.get('/api/trains', async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch trains' });
  }
});

app.post('/api/trains', async (req, res) => {
  try {
    const { name, from, to, time } = req.body;
    const train = new Train({ name, from, to, time });
    await train.save();
    res.status(201).json({ msg: "Train added", train });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to add train' });
  }
});

app.put('/api/trains/:id', async (req, res) => {
  try {
    const { name, from, to, time } = req.body;
    const updatedTrain = await Train.findByIdAndUpdate(req.params.id, { name, from, to, time }, { new: true });
    res.json({ msg: 'Train updated', train: updatedTrain });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update train' });
  }
});

app.delete('/api/trains/:id', async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Train deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete train' });
  }
});

// ✅ Bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const { email, train, date, time, coach, coachNumber, seat } = req.body;
    const booking = new Booking({ email, train, date, time, coach, coachNumber, seat });
    await booking.save();
    await sendBookingEmail(email, booking);
    res.status(201).json({ msg: "Booking successful & email sent!" });
  } catch (error) {
    res.status(500).json({ msg: "Server error during booking" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
