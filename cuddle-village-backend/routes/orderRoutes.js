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
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = (  req.body.status || order.status).toLowerCase();

  if (order.status === "paid") order.isPaid = true;
  if (order.status === "delivered") order.isDelivered = true;

  await order.save();

  res.json(order);
});

module.exports = router;