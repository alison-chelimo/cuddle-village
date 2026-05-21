const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getUsers, deleteUser, getStats, getAdvancedStats, getOrders, updateOrderStatus } = require("../controllers/adminController");

router.get("/users", protect, adminOnly, getUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser); // Implement deleteUser in adminController.js

router.get("/stats", protect, adminOnly, getStats);
router.get("/advanced-stats", protect, adminOnly, getAdvancedStats); // Implement getStats in adminController.js

router.get("/orders", protect, adminOnly, getOrders); // Implement getAllOrders in adminController.js
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus); // Implement updateOrderStatus in adminController.js

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;