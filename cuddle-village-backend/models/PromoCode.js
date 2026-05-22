const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
  code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:     { type: String, default: "" },
  discountType:    { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue:   { type: Number, required: true, min: 0 },
  minOrderAmount:  { type: Number, default: 0 },
  maxUsage:        { type: Number, default: 0 }, // 0 = unlimited
  usageCount:      { type: Number, default: 0 },
  expiresAt:       { type: Date, default: null },
  isActive:        { type: Boolean, default: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("PromoCode", promoCodeSchema);
