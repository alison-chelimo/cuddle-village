const router = require("express").Router();
const { register, login, verifyEmail, resendCode, forgotPassword, resetPassword, getProfile, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend", resendCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/password", protect, changePassword);

module.exports = router; 