const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
 
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, bookClub } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const getGroup = (age) => {
    const n = parseInt(age, 10);
        if (n >= 4 && n <= 5) return "early-learners";
        if (n >= 6 && n <= 8) return "growing-readers";
        return null;
      };

      if (bookClub && bookClub.childAge) {
        bookClub.group = getGroup(bookClub.childAge);
      }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      verificationCode: code,
      ...User(bookClub && { bookClub })
    });

  
      sendEmail(email, code).catch(
        err => {
          console.error("Email failed:", err.message);
        });

      res.json({ message: "Account created. Check your email for verification code." });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if(!user.isVerified) {
        return res.status(400).json({message: "Verify your email first"});
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }
 
    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bookClub: user.bookClub || null
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  console.log("Received email:", JSON.stringify(email));
  console.log("Received code:", JSON.stringify(code));

  const user = await User.findOne({ email: email.toLowerCase() });
  console.log("Found user:", !!user);
  console.log("Stored code:", JSON.stringify(user?.verificationCode));
  console.log("Matching codes:", user?.verificationCode.trim() === code.trim());


  if (!user || user.verificationCode.trim() !== code.trim()) {
    console.log("FAILED MATCH:", user?.verificationCode, code);
    return res.status(400).json({ message: "Invalid code" });
  }

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  ); 

  res.json({ 
    message: "Email verified", 
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bookClub: user.bookClub || null
    } 
  } );

};

exports.resendCode = async (req, res) => {
  const { email } =req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if(!user) return res.status(400).json({message: "User not found" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  await user.save();

  await sendEmail(email, code);

  res.json({ message: "New code sent" });
};

// FORGOT PASSWORD — sends a reset link to the user's email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond 200 to avoid leaking whether an account exists
    if (!user) return res.json({ message: "If that email is registered, a reset link has been sent." });

    const plainToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken   = crypto.createHash("sha256").update(plainToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${plainToken}`;

    await user.save();

    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"The Cuddle Village" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:30px;border-radius:12px;border:1px solid #eee;">
          <h2 style="color:#afa7e7;">The Cuddle Village 🧸</h2>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#afa7e7;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
            Reset Password
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:20px;">If you didn't request this, ignore this email.</p>
        </div>`,
    });

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

// RESET PASSWORD — validates token and updates the password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Reset link is invalid or has expired." });

    user.password             = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -verificationCode -resetPasswordToken -resetPasswordExpires");
  res.json(user);
};

// UPDATE PROFILE (name, phone)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name)  user.name  = name.trim();
    if (phone) user.phone = phone.trim();

    await user.save();
    res.json({ message: "Profile updated", user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// CHANGE PASSWORD (requires current password)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};