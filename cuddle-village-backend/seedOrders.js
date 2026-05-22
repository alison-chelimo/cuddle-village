/**
 * seedOrders.js — The Cuddle Village order seeder
 *
 * Creates 6 sample orders for the seeded users.
 * Run AFTER seedUsers.js and Seedproducts.js.
 *
 * USAGE:
 *   node seedOrders.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Order    = require("./models/Order");
const User     = require("./models/User");
const Product  = require("./models/Product");

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    const [jane, admin, products] = await Promise.all([
      User.findOne({ email: "jane@cuddlevillage.com" }),
      User.findOne({ email: "admin@cuddlevillage.com" }),
      Product.find().limit(20),
    ]);

    if (!jane || !admin) {
      console.error("❌ Seeded users not found. Run seedUsers.js first.");
      process.exit(1);
    }
    if (products.length < 4) {
      console.error("❌ Products not found. Run Seedproducts.js first.");
      process.exit(1);
    }

    const p = (i) => products[i % products.length];

    const NAIROBI = { street: "14 Biashara Street", city: "Nairobi", postalCode: "00100", country: "Kenya" };
    const WESTLANDS = { street: "Westlands Mall, Ground Floor", city: "Nairobi", postalCode: "00800", country: "Kenya" };

    const orders = [
      {
        user: jane._id,
        items: [
          { product: p(0)._id, name: p(0).name, qty: 2, price: p(0).price, image: p(0).image || null },
          { product: p(2)._id, name: p(2).name, qty: 1, price: p(2).price, image: p(2).image || null },
        ],
        shippingAddress: NAIROBI,
        paymentMethod: "M-Pesa",
        totalPrice: p(0).price * 2 + p(2).price,
        paymentStatus: "paid",
        paymentReference: "MPESA-TXN-001",
        status: "delivered",
      },
      {
        user: jane._id,
        items: [
          { product: p(5)._id, name: p(5).name, qty: 1, price: p(5).price, image: p(5).image || null },
        ],
        shippingAddress: NAIROBI,
        paymentMethod: "M-Pesa",
        totalPrice: p(5).price,
        paymentStatus: "paid",
        paymentReference: "MPESA-TXN-002",
        status: "shipped",
      },
      {
        user: jane._id,
        items: [
          { product: p(8)._id, name: p(8).name, qty: 3, price: p(8).price, image: p(8).image || null },
          { product: p(10)._id, name: p(10).name, qty: 1, price: p(10).price, image: p(10).image || null },
        ],
        shippingAddress: WESTLANDS,
        paymentMethod: "Card",
        totalPrice: p(8).price * 3 + p(10).price,
        paymentStatus: "unpaid",
        status: "pending",
      },
      {
        user: admin._id,
        items: [
          { product: p(3)._id, name: p(3).name, qty: 1, price: p(3).price, image: p(3).image || null },
          { product: p(7)._id, name: p(7).name, qty: 2, price: p(7).price, image: p(7).image || null },
        ],
        shippingAddress: NAIROBI,
        paymentMethod: "M-Pesa",
        totalPrice: p(3).price + p(7).price * 2,
        paymentStatus: "paid",
        paymentReference: "MPESA-TXN-003",
        status: "processing",
      },
      {
        user: admin._id,
        items: [
          { product: p(12)._id, name: p(12).name, qty: 1, price: p(12).price, image: p(12).image || null },
        ],
        shippingAddress: WESTLANDS,
        paymentMethod: "M-Pesa",
        totalPrice: p(12).price,
        paymentStatus: "paid",
        paymentReference: "MPESA-TXN-004",
        status: "delivered",
      },
      {
        user: jane._id,
        items: [
          { product: p(15)._id, name: p(15).name, qty: 1, price: p(15).price, image: p(15).image || null },
          { product: p(1)._id,  name: p(1).name,  qty: 2, price: p(1).price,  image: p(1).image  || null },
        ],
        shippingAddress: NAIROBI,
        paymentMethod: "M-Pesa",
        totalPrice: p(15).price + p(1).price * 2,
        paymentStatus: "paid",
        paymentReference: "MPESA-TXN-005",
        status: "processing",
      },
    ];

    const existing = await Order.countDocuments();
    if (existing > 0) {
      console.log(`⏭️  Skipped — ${existing} order(s) already exist. Delete them first if you want to re-seed.`);
    } else {
      const inserted = await Order.insertMany(orders);
      console.log(`✅ Seeded ${inserted.length} sample orders.`);
    }

    console.log("\n🎉 Done!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();
