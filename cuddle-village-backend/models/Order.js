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

    isPaid: {
      type: Boolean,
      default: false,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending", // Pending → Paid → Delivered
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);