const router = require("express").Router();
const { register, login, verifyEmail, resendCode } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend", resendCode);

module.exports = router; 