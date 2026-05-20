const router = require("express").Router();
const {
  initializePayment,
  verifyPayment,
  webhook,
} = require("../controllers/paystackController");

// Initialize a new payment → returns { authorization_url, reference }
router.post("/initialize", initializePayment);

// Verify a payment by reference (called after user returns from Paystack popup)
router.get("/verify/:reference", verifyPayment);

// Paystack webhook — receives charge.success etc.
// IMPORTANT: This route must receive the raw body for signature verification.
// In your main app.js, register this route BEFORE express.json() middleware:
//   app.use("/api/paystack", require("./routes/paystackRoute"));
//   app.use(express.json()); ← after
// OR set express.raw() only for this path.
router.post("/webhook", webhook);

module.exports = router;