const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log("New Contact Message:", req.body);

  // You can save to DB or send email here
  res.json({ message: "Message received successfully" });
});

module.exports = router;