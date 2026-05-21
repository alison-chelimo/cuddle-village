const router = require("express").Router();
const { register, login, verifyEmail, resendCode, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend", resendCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router; 