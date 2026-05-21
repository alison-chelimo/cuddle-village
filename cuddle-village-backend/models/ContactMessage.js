const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   String,
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
