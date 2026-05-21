const mongoose = require("mongoose");

const learningSessionSchema = new mongoose.Schema({
  date:                { type: Date, required: true },
  group:               { type: String, enum: ["early-learners", "growing-readers"], required: true },
  title:               String,
  bookTitle:           String,
  bookAuthor:          String,
  activityDescription: String,
  facilitatorNotes:    String,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("LearningSession", learningSessionSchema);
