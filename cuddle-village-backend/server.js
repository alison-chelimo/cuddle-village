require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// dotenv.config();

const app = express();

// Restrict CORS to frontend origins
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

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
app.use("/api/loyalty",   require("./routes/loyaltyRoutes"));
app.use("/api/portal",    require("./routes/portalRoutes"));
app.use("/api/promo",     require("./routes/promoRoutes"));
app.use("/api/paystack",  require("./routes/paystackRoute"));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.log(err)); 