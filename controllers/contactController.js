const Contact = require('../models/contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Contact({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
