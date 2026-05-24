const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");


// =============================
// CREATE ORDER (CHECKOUT)
// =============================
router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 🔥 STOCK CHECK + REDUCTION
    for (let item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      // 🔻 REDUCE STOCK
      product.stock -= item.qty;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
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
    const newStatus = req.body.status?.toLowerCase();
    if (!newStatus) return res.status(400).json({ message: "Status is required" });

    const updateFields = { status: newStatus };

    if (newStatus === "paid") {
      updateFields.isPaid = true;
      updateFields.paymentStatus = "paid";
      updateFields.paidAt = new Date();
    }
    if (newStatus === "delivered") {
      updateFields.isDelivered = true;
    }
    if (newStatus === "cancelled") {
      updateFields.paymentStatus = "unpaid";
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: false } // ← skips full doc validation
    );

    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Order update error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;