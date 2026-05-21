const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET); 

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();

  } catch (err) {
    console.error("JWT verify error:", err.message); 

    res.status(401).json({ message: "Invalid token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin only" });
  }
};

// Allows both admin and facilitator roles
exports.facilitatorOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "facilitator")) {
    next();
  } else {
    return res.status(403).json({ message: "Facilitator access required" });
  }
};