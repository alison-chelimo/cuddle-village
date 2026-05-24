const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        qty: Number,
        price: Number,
        image: String,
      },
    ],

    shippingAddress: {
      address: String,
      city: String,
      phone: String,
    },

    paymentMethod: {
      type: String,
      default: "M-Pesa",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },

    paymentReference: {
      type: String,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    pointsEarned:   { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    pointsDiscount: { type: Number, default: 0 },

    promoCode:      { type: String, default: null },
    promoDiscount:  { type: Number, default: 0 },

    trackingNumber: { type: String, default: null },

    receiptSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);