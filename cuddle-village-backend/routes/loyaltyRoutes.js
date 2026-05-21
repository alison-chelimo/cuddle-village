const router             = require("express").Router();
const { protect }        = require("../middleware/authMiddleware");
const User               = require("../models/User");
const Order              = require("../models/Order");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const { calcTier, nextTierInfo, TIERS } = require("../utils/loyaltyHelper");

// GET /api/loyalty/balance
router.get("/balance", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("loyaltyPoints lifetimePoints loyaltyTier");
  res.json({
    points:        user.loyaltyPoints,
    lifetimePoints: user.lifetimePoints,
    tier:          user.loyaltyTier,
    nextTier:      nextTierInfo(user.lifetimePoints),
  });
});

// GET /api/loyalty/transactions
router.get("/transactions", protect, async (req, res) => {
  const txns = await LoyaltyTransaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.json(txns);
});

// POST /api/loyalty/redeem
// Body: { pointsToRedeem, orderId }
// Called after order creation but before Paystack initialization.
router.post("/redeem", protect, async (req, res) => {
  try {
    const { pointsToRedeem, orderId } = req.body;

    if (!pointsToRedeem || !orderId) {
      return res.status(400).json({ message: "pointsToRedeem and orderId are required" });
    }

    const pts = parseInt(pointsToRedeem, 10);
    if (pts <= 0) return res.status(400).json({ message: "Invalid points amount" });

    const user = await User.findById(req.user._id);
    if (user.loyaltyPoints < pts) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus !== "unpaid") {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (order.pointsRedeemed > 0) {
      return res.status(400).json({ message: "Points already applied to this order" });
    }

    // 100 points = KES 50 (50% value)
    const discount = Math.round(pts / 2);
    const newTotal  = Math.max(0, order.totalPrice - discount);

    user.loyaltyPoints   -= pts;
    user.loyaltyTier      = calcTier(user.lifetimePoints); // lifetimePoints unchanged on redeem
    order.pointsRedeemed  = pts;
    order.pointsDiscount  = discount;
    order.totalPrice      = newTotal;

    await Promise.all([
      user.save(),
      order.save(),
      LoyaltyTransaction.create({
        user:         req.user._id,
        type:         "redeem",
        points:       -pts,
        reason:       "Checkout redemption",
        orderId,
        balanceAfter: user.loyaltyPoints,
      }),
    ]);

    res.json({
      discount,
      newTotal,
      pointsRemaining: user.loyaltyPoints,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ message: "Redemption failed" });
  }
});

module.exports = router;
