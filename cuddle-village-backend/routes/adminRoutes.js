const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { adminLimiter } = require("../middleware/rateLimiter");

router.use(adminLimiter);
const {
  getUsers, deleteUser, getStats, getAdvancedStats, getOrders, updateOrderStatus,
  updateUserRole, createUser } = require("../controllers/adminController");
const {
  getPromoCodes, createPromoCode, togglePromoCode, deletePromoCode,
} = require("../controllers/promoController");

router.get("/users", protect, adminOnly, getUsers);
router.post("/users", protect, adminOnly, createUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);

router.get("/stats", protect, adminOnly, getStats);
router.get("/advanced-stats", protect, adminOnly, getAdvancedStats); // Implement getStats in adminController.js

router.get("/orders", protect, adminOnly, getOrders); // Implement getAllOrders in adminController.js
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus); // Implement updateOrderStatus in adminController.js

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Promo codes
router.get("/promo-codes",        protect, adminOnly, getPromoCodes);
router.post("/promo-codes",       protect, adminOnly, createPromoCode);
router.patch("/promo-codes/:id",  protect, adminOnly, togglePromoCode);
router.delete("/promo-codes/:id", protect, adminOnly, deletePromoCode);

module.exports = router;