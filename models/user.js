const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  contact: {
    type: String,
    trim: true,
    default: ''
  },

  address: {
    type: String,
    trim: true,
    default: ''
  },

  date: {
    type: Date,
    default: Date.now
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpire: {
    type: Date,
    default: null
  }

}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
