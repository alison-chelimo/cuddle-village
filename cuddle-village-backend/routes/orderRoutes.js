const mongoose = require("mongoose");
const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { resolvePromo } = require("../controllers/promoController");
const { orderLimiter } = require("../middleware/rateLimiter");

router.use(orderLimiter);


// =============================
// CREATE ORDER (CHECKOUT)
// =============================
router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, promoCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Stock check + reduction
    for (let item of orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await Product.findById(new mongoose.Types.ObjectId(item.product));
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.stock < item.qty) return res.status(400).json({ message: `${product.name} is out of stock` });
      product.stock -= item.qty;
      await product.save();
    }

    // Validate promo code if provided
    let promoDiscount = 0;
    let promoId       = null;
    let appliedCode   = null;

    if (promoCode) {
      const promoResult = await resolvePromo(promoCode, totalPrice);
      if (promoResult.valid) {
        promoDiscount = promoResult.discount;
        promoId       = promoResult.promo._id;
        appliedCode   = promoResult.promo.code;
        // Increment usage count
        await PromoCode.findByIdAndUpdate(promoId, { $inc: { usageCount: 1 } });
      }
    }

    const finalTotal = Math.max(0, totalPrice - promoDiscount);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice: finalTotal,
      promoCode:     appliedCode,
      promoDiscount,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =============================
// GET USER ORDERS
// =============================
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});


// =============================
// ADMIN: GET ALL ORDERS
// =============================
router.get("/", protect, adminOnly, async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
});


// =============================
// ADMIN: UPDATE STATUS
// =============================
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const newStatus = req.body.status?.toLowerCase();

    if (newStatus && !VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = await Order.findById(new mongoose.Types.ObjectId(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (newStatus && newStatus !== order.status) {
      order.status = newStatus;
      order.statusHistory.push({
        status:        newStatus,
        updatedBy:     req.user._id,
        updatedByName: req.user.name || "Admin",
        updatedAt:     new Date(),
      });
    } else if (newStatus) {
      order.status = newStatus;
    }

    if (req.body.trackingNumber !== undefined) {
      order.trackingNumber = req.body.trackingNumber ? String(req.body.trackingNumber) : null;
    }

    if (order.status === "delivered") order.isDelivered = true;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("❌ Order update error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;