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