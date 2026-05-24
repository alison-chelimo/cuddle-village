const router     = require("express").Router();
const rateLimit  = require("express-rate-limit");
const { register, login, verifyEmail, resendCode, forgotPassword, resetPassword, getProfile, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Strict limiter for routes that send emails or touch passwords
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait 15 minutes and try again." },
});

// Looser limiter for login (allow reasonable retries)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please wait 15 minutes." },
});

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

router.post("/register",        authLimiter,    register);
router.post("/login",           loginLimiter,   login);
router.post("/verify",          authLimiter,    verifyEmail);
router.post("/resend",          authLimiter,    resendCode);
router.post("/forgot-password", authLimiter,    forgotPassword);
router.post("/reset-password",  authLimiter,    resetPassword);
router.get("/profile",          profileLimiter, protect, getProfile);
router.put("/profile",          profileLimiter, protect, updateProfile);
router.put("/profile/password", profileLimiter, protect, changePassword);

module.exports = router; 