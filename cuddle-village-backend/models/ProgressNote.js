const mongoose = require("mongoose");

const progressNoteSchema = new mongoose.Schema({
  child:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content:   { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("ProgressNote", progressNoteSchema);
