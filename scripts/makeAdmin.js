// scripts/makeAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 🟢 Replace this with your actual MongoDB URI
const MONGO_URI = 'mongodb+srv://vikasprajapat3160:oC0C2lGqlQnW5MlL@cluster0.a7ydotf.mongodb.net/';

// 🟢 Replace this with your actual User model schema
const User = require('../models/User'); // adjust the path as per your project

const makeAdmin = async () => {
  try {
    // Connect to MongoDB (without deprecated options)
    await mongoose.connect(MONGO_URI);

    const email = 'vikasprajapat3160@gmail.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ User updated: ${email} is now an admin.`);
      } else {
        console.log(`ℹ️ User already an admin: ${email}`);
      }
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10); // default password

      const newUser = new User({
        fullname: 'Admin Vikas',    // <-- required field added here
        email,
        password: hashedPassword,
        role: 'admin',
      });

      await newUser.save();
      console.log(`✅ New admin created: ${email}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
};

makeAdmin();
