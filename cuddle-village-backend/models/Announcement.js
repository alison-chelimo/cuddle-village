const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  body:        { type: String, required: true },
  targetGroup: { type: String, enum: ["early-learners", "growing-readers", "all"], default: "all" },
  status:      { type: String, enum: ["draft", "sent"], default: "draft" },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
