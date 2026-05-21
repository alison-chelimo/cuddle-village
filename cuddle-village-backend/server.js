require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// dotenv.config();

const app = express();

app.use(cors());

// Paystack Webhook
app.use(
  "/api/paystack/webhook",
  express.raw({ type: "application/json" }),
  require("./routes/paystackRoute")
);

// Other middleware
app.use(express.json());

// Routes come AFTER middleware
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoute"));
app.use("/api/book-club", require("./routes/bookClubRoute"));
app.use("/api/paystack", require("./routes/paystackRoute"));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch(err => console.log(err)); 