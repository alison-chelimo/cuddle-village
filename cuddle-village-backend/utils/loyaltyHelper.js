const mongoose           = require("mongoose");
const User               = require("../models/User");
const Order              = require("../models/Order");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");

const TIERS = [
  { name: "Platinum", min: 15000 },
  { name: "Gold",     min: 5000  },
  { name: "Silver",   min: 1000  },
  { name: "Bronze",   min: 0     },
];

function calcTier(lifetimePoints) {
  return (TIERS.find(t => lifetimePoints >= t.min) || TIERS[TIERS.length - 1]).name;
}

// Points earned: 1 point per KES 10 spent
function calcPoints(totalPrice) {
  return Math.floor(totalPrice / 10);
}

// Next tier threshold (for progress bar on frontend)
function nextTierInfo(lifetimePoints) {
  const thresholds = [1000, 5000, 15000];
  const next = thresholds.find(t => t > lifetimePoints);
  return next ?? null;
}

// Award points after a confirmed payment.
// Guard: checks order.pointsEarned > 0 to prevent double-award
// when both webhook and verifyPayment fire for the same order.
async function awardLoyaltyPoints(userId, orderId, totalPrice) {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) return;
    const order = await Order.findById(orderId);
    if (!order || order.pointsEarned > 0) return; // already awarded

    const earned = calcPoints(totalPrice);
    if (earned <= 0) return;

    const user = await User.findById(userId);
    if (!user) return;

    user.loyaltyPoints  += earned;
    user.lifetimePoints += earned;
    user.loyaltyTier     = calcTier(user.lifetimePoints);

    order.pointsEarned = earned;

    await Promise.all([
      user.save(),
      order.save(),
      LoyaltyTransaction.create({
        user:         userId,
        type:         "earn",
        points:       earned,
        reason:       "Order payment",
        orderId,
        balanceAfter: user.loyaltyPoints,
      }),
    ]);
  } catch (err) {
    // Non-fatal — log but don't break the payment confirmation flow
    console.error("awardLoyaltyPoints error:", err.message);
  }
}

module.exports = { awardLoyaltyPoints, calcTier, calcPoints, nextTierInfo, TIERS };
