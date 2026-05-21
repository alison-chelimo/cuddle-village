const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type:         { type: String, enum: ["earn", "redeem"], required: true },
  points:       { type: Number, required: true },
  reason:       { type: String },
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  balanceAfter: { type: Number },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
