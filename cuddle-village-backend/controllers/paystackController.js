const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { awardLoyaltyPoints } = require("../utils/loyaltyHelper");
const { sendReceiptEmail } = require("../utils/sendEmail");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY; // sk_live_xxx or sk_test_xxx
const BASE_URL = "https://api.paystack.co";

// ─── Helper: Paystack headers ────────────────────────────────────────────────
const headers = () => ({
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  "Content-Type": "application/json",
});

// ─── Initialize Transaction ───────────────────────────────────────────────────
// POST /paystack/initialize
// Body: { email, amount (KES), orderId, callbackUrl }
exports.initializePayment = async (req, res) => {
  const { email, amount, orderId, callbackUrl } = req.body;

  if (!email || !amount || !orderId) {
    return res.status(400).json({ message: "email, amount, and orderId are required" });
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/transaction/initialize`,
      {
        email,
        // Paystack expects amount in KOBO (KES minor unit = cents, 1 KES = 100)
        amount: Math.ceil(amount) * 100,
        currency: "KES",
        reference: `CV-${orderId}-${Date.now()}`,
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId,
          custom_fields: [
            { display_name: "Order ID", variable_name: "order_id", value: orderId },
          ],
        },
        channels: ["card", "mobile_money", "bank", "ussd", "bank_transfer"],
      },
      { headers: headers() }
    );

    console.log("✅ Paystack initialized:", response.data.data.reference);
    res.json(response.data.data); // returns { authorization_url, access_code, reference }
  } catch (err) {
    console.error("❌ Paystack init error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Paystack error",
      detail: err.response?.data || err.message,
    });
  }
};

// ─── Verify Transaction ───────────────────────────────────────────────────────
// GET /paystack/verify/:reference
exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;

  if (!reference) return res.status(400).json({ message: "Reference is required" });
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(reference)) {
    return res.status(400).json({ message: "Invalid reference format" });
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: headers() }
    );

    const data = response.data.data;
    let success = data.status === "success";
    const orderId = data.metadata?.orderId;
    const safeOrderId = mongoose.Types.ObjectId.isValid(orderId)
      ? new mongoose.Types.ObjectId(orderId)
      : null;

    if (success && safeOrderId) {
      console.log("✅ Payment verified for order:", orderId, "ref:", reference);
      const order = await Order.findById(safeOrderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus    = "paid";
        order.paymentReference = reference;
        order.paidAt           = new Date();
        await order.save();
        await awardLoyaltyPoints(order.user, orderId, order.totalPrice);
        sendReceiptEmail(safeOrderId).catch(err =>
          console.error("Receipt email error (verify):", err.message)
        );
      }
    }

    // Fallback: Paystack can return "pending" for a few seconds after redirect.
    // If the webhook already processed the payment, trust the DB.
    if (!success && safeOrderId) {
      const order = await Order.findById(safeOrderId);
      if (order?.paymentStatus === "paid") {
        console.log("✅ DB fallback: order already paid by webhook, ref:", reference);
        return res.json({
          success: true, status: "success",
          reference: data.reference,
          amount: data.amount / 100,
          currency: data.currency,
          channel: data.channel,
          orderId,
          paidAt: order.paidAt,
        });
      }
    }

    res.json({
      success,
      status: data.status,
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      channel: data.channel,
      orderId,
      paidAt: data.paid_at,
    });
  } catch (err) {
    console.error("❌ Paystack verify error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Verification error",
      detail: err.response?.data || err.message,
    });
  }
};

// ─── Webhook (Paystack calls this after payment events) ──────────────────────
// POST /paystack/webhook
exports.webhook = async (req, res) => {
  const crypto = require("crypto");

  // Validate the event came from Paystack
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.warn("⚠️  Invalid Paystack webhook signature");
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;
  console.log("📲 Paystack webhook:", event.event, event.data?.reference);

  if (event.event === "charge.success") {
    const data    = event.data;
    const orderId = data.metadata?.orderId;
    const safeOrderId = mongoose.Types.ObjectId.isValid(orderId)
      ? new mongoose.Types.ObjectId(orderId)
      : null;
    console.log("✅ Charge success for order:", orderId, "| ref:", data.reference);

    if (safeOrderId) {
      const order = await Order.findById(safeOrderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus    = "paid";
        order.paymentReference = data.reference;
        order.paidAt           = new Date(data.paid_at);
        await order.save();
        await awardLoyaltyPoints(order.user, orderId, order.totalPrice);
        sendReceiptEmail(safeOrderId).catch(err =>
          console.error("Receipt email error (webhook):", err.message)
        );
      }
    }
  }

  // Always respond 200 — Paystack expects this
  res.sendStatus(200);
};