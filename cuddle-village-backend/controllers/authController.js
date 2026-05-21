const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { resetPasswordEmail } = require("../utils/emailTemplates");
const { createTransporter } = require("../utils/sendEmail");
 
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
        bookClub:       user.bookClub || null,
        loyaltyPoints:  user.loyaltyPoints  || 0,
        loyaltyTier:    user.loyaltyTier    || "Bronze",
        lifetimePoints: user.lifetimePoints || 0,
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

// FORGOT PASSWORD — emails a 6-digit OTP (same pattern as email verification)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond 200 to avoid leaking whether an account exists
    if (!user) return res.json({ message: "If that email is registered, a reset code has been sent." });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken   = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"The Cuddle Village" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your password reset code — The Cuddle Village",
      text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
      html: resetPasswordEmail(code),
    });

    res.json({ message: "If that email is registered, a reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

// RESET PASSWORD — accepts { email, code, password } in request body
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ message: "Email, code, and new password are required." });
    }

    const user = await User.findOne({
      email:                email.toLowerCase(),
      resetPasswordToken:   code.trim(),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Code is invalid or has expired." });

    user.password             = await bcrypt.hash(password, 10);
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