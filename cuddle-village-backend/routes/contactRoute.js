const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    await ContactMessage.create({
      name:    String(name),
      email:   String(email),
      phone:   phone ? String(phone) : undefined,
      message: String(message),
    });
    res.json({ message: "Message received successfully" });
  } catch (err) {
    console.error("Contact save error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
});

module.exports = router;