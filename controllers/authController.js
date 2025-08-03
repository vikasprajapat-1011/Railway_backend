const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    let { fullname, email, password, contact, address, date } = req.body;

    console.log("📥 Incoming registration request:", req.body);

    // ✅ Validate required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    // ✅ Normalize email
    email = email.toLowerCase().trim();
    console.log("🔍 Normalized email:", email);

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log("👤 Existing user found:", existingUser ? "Yes" : "No");

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user object
    const newUser = new User({
      fullname: fullname.trim(),
      email,
      password: hashedPassword,
      contact: contact?.trim(),
      address: address?.trim(),
      date: date ? new Date(date) : new Date(),
      role: 'user',
    });

    // ✅ Save to database
    await newUser.save();
    console.log("✅ New user saved:", newUser.email);

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Send success response
    return res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (err) {
    console.error("❌ Registration Error:", err);

    // ✅ Handle duplicate key error from MongoDB
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ msg: "Email already registered (via unique index)" });
    }

    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body)

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({
      msg: 'User login successful',
      token,
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role, // ✅ Add this line
      },
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
// forgot password:-
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Validate email
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // ✅ Generate reset token and hash it
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // ✅ Save hashed token and expiry in the DB
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;


    // ✅ Nodemailer setup using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // App password (not regular password)
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.fullname},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p><strong>This link is valid for 10 minutes only.</strong></p>
        <p>If you did not request this, you can safely ignore it.</p>
      `,
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'Reset email sent successfully' });

  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
// reset password:-
exports.resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ msg: 'New password is required' });
    }

    // ✅ Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // ✅ Find matching user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // ✅ Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};