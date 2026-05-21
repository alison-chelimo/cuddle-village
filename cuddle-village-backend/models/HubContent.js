const mongoose = require("mongoose");

const hubContentSchema = new mongoose.Schema({
  group:       { type: String, enum: ["early-learners", "growing-readers"], required: true },
  contentType: { type: String, enum: ["book", "activity", "milestone"], required: true },
  title:       String,
  author:      String,
  emoji:       String,
  tag:         String,
  description: String,
  weekLabel:   String,
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("HubContent", hubContentSchema);
