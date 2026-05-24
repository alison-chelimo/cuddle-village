/**
 * seedUsers.js — The Cuddle Village user seeder
 *
 * Creates sample admin, facilitator, and regular-user accounts for testing.
 * Safe to re-run: skips any user whose email already exists.
 *
 * USAGE (run from your backend folder):
 *   node seedUsers.js
 *
 * SAMPLE CREDENTIALS
 * ──────────────────
 *   Admin        →  admin@cuddlevillage.com        / Admin@1234
 *   Facilitator  →  facilitator@cuddlevillage.com  / Facilitator@1
 *   Regular user →  jane@cuddlevillage.com         / User@12345
 */

require("dotenv").config();
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const User      = require("./models/User");

const USERS = [
  {
    name:     "Admin User",
    email:    "admin@cuddlevillage.com",
    password: "Admin@1234",
    role:     "admin",
    phone:    "0712345678",
  },
  {
    name:     "Book Club Facilitator",
    email:    "facilitator@cuddlevillage.com",
    password: "Facilitator@1",
    role:     "facilitator",
    phone:    "0723456789",
  },
  {
    name:     "Jane Wanjiru",
    email:    "jane@cuddlevillage.com",
    password: "User@12345",
    role:     "user",
    phone:    "0734567890",
    loyaltyPoints:  250,
    lifetimePoints: 250,
    loyaltyTier:    "Bronze",
  },
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    for (const u of USERS) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`⏭️  Skipped  ${u.email}  (already exists)`);
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({
        name:           u.name,
        email:          u.email,
        password:       hashed,
        phone:          u.phone,
        role:           u.role,
        isVerified:     true,
        loyaltyPoints:  u.loyaltyPoints  ?? 0,
        lifetimePoints: u.lifetimePoints ?? 0,
        loyaltyTier:    u.loyaltyTier    ?? "Bronze",
      });
      console.log(`✅ Created  ${u.email}  (${u.role})`);
    }

    console.log("\n🎉 Done! Sample users are ready.");
    console.log("\nSample credentials:");
    console.log("  Admin        →  admin@cuddlevillage.com        / Admin@1234");
    console.log("  Facilitator  →  facilitator@cuddlevillage.com  / Facilitator@1");
    console.log("  Regular user →  jane@cuddlevillage.com         / User@12345");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected.");
  }
}

seed();
