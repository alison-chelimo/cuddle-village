const mongoose  = require("mongoose");
const PromoCode = require("../models/PromoCode");

// Shared validation logic
async function resolvePromo(code, orderAmount) {
  if (!code) return { valid: false, message: "Enter a promo code." };

  const promo = await PromoCode.findOne({ code: code.trim().toUpperCase() });
  if (!promo || !promo.isActive) return { valid: false, message: "This promo code is invalid or has been deactivated." };
  if (promo.expiresAt && new Date() > promo.expiresAt) return { valid: false, message: "This promo code has expired." };
  if (promo.maxUsage > 0 && promo.usageCount >= promo.maxUsage) return { valid: false, message: "This promo code has reached its usage limit." };
  if (promo.minOrderAmount > 0 && orderAmount < promo.minOrderAmount) {
    return { valid: false, message: `Minimum order amount for this code is KES ${promo.minOrderAmount.toLocaleString()}.` };
  }

  const discount = promo.discountType === "percentage"
    ? Math.round((promo.discountValue / 100) * orderAmount)
    : Math.min(promo.discountValue, orderAmount);

  return { valid: true, promo, discount };
}

// POST /api/promo/validate  (public — no auth needed)
exports.validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const result = await resolvePromo(code, Number(orderAmount) || 0);
    if (!result.valid) return res.status(400).json({ valid: false, message: result.message });
    const { promo, discount } = result;
    res.json({
      valid:         true,
      promoId:       promo._id,
      code:          promo.code,
      discountType:  promo.discountType,
      discountValue: promo.discountValue,
      discount,
      message: promo.discountType === "percentage"
        ? `${promo.discountValue}% off applied!`
        : `KES ${discount.toLocaleString()} off applied!`,
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: "Could not validate code." });
  }
};

// GET /api/admin/promo-codes
exports.getPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 }).populate("createdBy", "name");
    res.json(codes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/promo-codes
exports.createPromoCode = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxUsage, expiresAt } = req.body;
    if (!code || !discountType || discountValue == null) {
      return res.status(400).json({ message: "Code, discountType, and discountValue are required." });
    }
    const existing = await PromoCode.findOne({ code: code.trim().toUpperCase() });
    if (existing) return res.status(400).json({ message: "A promo code with that name already exists." });

    const promo = await PromoCode.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUsage:       Number(maxUsage) || 0,
      expiresAt:      expiresAt || null,
      createdBy:      req.user._id,
    });
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/promo-codes/:id  (toggle active)
exports.togglePromoCode = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Not found" });
    const promo = await PromoCode.findById(new mongoose.Types.ObjectId(req.params.id));
    if (!promo) return res.status(404).json({ message: "Not found" });
    promo.isActive = !promo.isActive;
    await promo.save();
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/promo-codes/:id
exports.deletePromoCode = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Not found" });
    await PromoCode.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.resolvePromo = resolvePromo;
