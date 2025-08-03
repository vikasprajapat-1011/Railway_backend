const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Railway_Management";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("\x1b[32m%s\x1b[0m", "✅ MongoDB connected successfully");
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit the app on DB failure
  }
};

module.exports = connectDB;
