/**
 * seedProducts.js — The Cuddle Village product seeder
 *
 * Inserts all products from the catalog into MongoDB.
 * Safe to re-run: clears existing products first, then re-inserts.
 *
 * USAGE (run from your backend folder):
 *   node seedProducts.js
 *
 * REQUIREMENTS:
 *   • Your backend .env file must contain MONGO_URI
 *   • Run: npm install dotenv mongoose  (if not already installed)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Product  = require("./models/Product");

const CATALOG = [
  {
    category: "diaper", emoji: "👶",
    subcategories: [
      {
        subcategory: "diaper-disposable",
        products: [
          { name: "Newborn Diapers",         price: 550  },  // ~44 count pack
          { name: "Small Diapers",           price: 620  },  // size 2, 40 count
          { name: "Medium Diapers",          price: 680  },  // size 3, 36 count
          { name: "Large Diapers",           price: 750  },  // size 4, 32 count
          { name: "XL Diapers",              price: 820  },  // size 5, 28 count
        ],
      },
      {
        subcategory: "diaper-misc",
        products: [
          { name: "Training Pants",           price: 950  },
          { name: "Baby Wipes (Single Pack)", price: 180  },
          { name: "Baby Wipes (Bulk Pack)",   price: 650  },
          { name: "Diaper Rash Cream",        price: 450  },
          { name: "Changing Mat",             price: 1200 },
          { name: "Diaper Bin",               price: 2500 },
          { name: "Changing Bag",             price: 3500 },
        ],
      },
    ],
  },
  {
    category: "clothing", emoji: "👕",
    subcategories: [
      {
        subcategory: "clothing-newborn",
        products: [
          { name: "Newborn Onesie",     price: 650  },
          { name: "Newborn Romper",     price: 750  },
          { name: "Newborn Sleep Suit", price: 850  },
          { name: "Mittens & Booties",  price: 450  },
          { name: "Newborn Cap",        price: 300  },
        ],
      },
      {
        subcategory: "clothing-infant",
        products: [
          { name: "Infant Bodysuit",  price: 700  },
          { name: "Infant Dress",     price: 950  },
          { name: "Two-Piece Set",    price: 1200 },
          { name: "Infant Jacket",    price: 1500 },
          { name: "Infant Sweater",   price: 1100 },
        ],
      },
      {
        subcategory: "clothing-extras",
        products: [
          { name: "Baby Socks",   price: 250  },  // pack of 5 pairs
          { name: "Swaddle Wrap", price: 850  },
          { name: "Baby Blanket", price: 1200 },
        ],
      },
    ],
  },
  {
    category: "feeding", emoji: "🍼",
    subcategories: [
      {
        subcategory: "feeding-bottles",
        products: [
          { name: "Feeding Bottle (Small)",  price: 650  },
          { name: "Feeding Bottle (Medium)", price: 750  },
          { name: "Feeding Bottle (Large)",  price: 900  },
          { name: "Manual Breast Pump",      price: 2800 },
          { name: "Electric Breast Pump",    price: 8500 },
          { name: "Bottle Sterilizer",       price: 3500 },
          { name: "Bottle Warmer",           price: 2800 },
        ],
      },
      {
        subcategory: "feeding-mealtime",
        products: [
          { name: "Baby Bib",          price: 350  },
          { name: "Burp Cloth",        price: 450  },  // pack of 3
          { name: "Sippy Cup",         price: 650  },
          { name: "Baby Spoon & Bowl", price: 750  },
          { name: "High Chair",        price: 7500 },
        ],
      },
    ],
  },
  {
    category: "bath", emoji: "🛁",
    subcategories: [
      {
        subcategory: "bath-cleansing",
        products: [
          { name: "Baby Soap",    price: 280  },
          { name: "Baby Shampoo", price: 350  },
          { name: "Baby Lotion",  price: 380  },
          { name: "Baby Oil",     price: 320  },
          { name: "Baby Powder",  price: 280  },
        ],
      },
      {
        subcategory: "bath-accessories",
        products: [
          { name: "Baby Towel",     price: 950  },
          { name: "Baby Washcloth", price: 350  },  // pack of 3
          { name: "Baby Bathtub",   price: 2200 },
          { name: "Grooming Kit",   price: 1500 },
        ],
      },
    ],
  },
  {
    category: "travel", emoji: "🚼",
    subcategories: [
      {
        subcategory: "travel-go",
        products: [
          { name: "Stroller",     price: 18000 },
          { name: "Car Seat",     price: 12000 },
          { name: "Baby Carrier", price: 4500  },
          { name: "Diaper Bag",   price: 3200  },
        ],
      },
      {
        subcategory: "travel-nursery",
        products: [
          { name: "Baby Cot / Crib", price: 15000 },
          { name: "Crib Mattress",   price: 4500  },
          { name: "Bedding Set",     price: 2800  },
          { name: "Mosquito Net",    price: 1200  },
        ],
      },
    ],
  },
  {
    category: "toys", emoji: "🧸",
    subcategories: [
      {
        subcategory: "toys-all",
        products: [
          { name: "Rattle",                     price: 450  },
          { name: "Teething Toy",               price: 650  },
          { name: "Activity Mat",               price: 3500 },
          { name: "Soft Toy",                   price: 1200 },
          { name: "Musical Toy",                price: 2200 },
          { name: "Educational Toy (0–5 yrs)",  price: 1800 },
        ],
      },
    ],
  },
  {
    category: "books", emoji: "📚",
    subcategories: [
      {
        subcategory: "books-0-3",
        products: [
          { name: "Board Book",   price: 650  },
          { name: "Sensory Book", price: 850  },
        ],
      },
      {
        subcategory: "books-4-8",
        products: [
          { name: "Storybook",    price: 750  },
          { name: "Picture Book", price: 650  },
          { name: "Early Reader", price: 850  },
        ],
      },
      {
        subcategory: "books-learning",
        products: [
          { name: "Flashcards",             price: 550  },
          { name: "Alphabet & Number Book", price: 650  },
          { name: "Activity Book",          price: 700  },
        ],
      },
    ],
  },
  {
    category: "gifts", emoji: "🎁",
    subcategories: [
      {
        subcategory: "gifts-all",
        products: [
          { name: "Newborn Starter Pack",    price: 5500  },
          { name: "Baby Shower Gift Hamper", price: 8500  },
          { name: "Bath Time Kit",           price: 3200  },
          { name: "Feeding Kit",             price: 4200  },
          { name: "Monthly Baby Box",        price: 6500  },
        ],
      },
    ],
  },
  {
    category: "health", emoji: "🩺",
    subcategories: [
      {
        subcategory: "health-all",
        products: [
          { name: "Thermometer",            price: 1800 },
          { name: "Baby First Aid Kit",     price: 2500 },
          { name: "Nasal Aspirator",        price: 850  },
          { name: "Baby-Safe Detergent",    price: 650  },
          { name: "Vitamins & Supplements", price: 1200 },
        ],
      },
    ],
  },
  {
    category: "mom", emoji: "🤱",
    subcategories: [
      {
        subcategory: "mom-all",
        products: [
          { name: "Maternity Wear",      price: 3500 },
          { name: "Nursing Bra",         price: 1800 },
          { name: "Breastfeeding Cover", price: 1500 },
          { name: "Postnatal Care Kit",  price: 4500 },
          { name: "Nursing Pillow",      price: 2800 },
        ],
      },
    ],
  },
];

// ─── Flatten catalog into Product documents ───────────────────────────────────
const products = CATALOG.flatMap(cat =>
  cat.subcategories.flatMap(sub =>
    sub.products.map(p => ({
      name:        p.name,
      price:       p.price,
      description: `${p.name} — carefully selected for your little one.`,
      category:    cat.category,
      image:       null,
      stock:       50,  // default stock for testing
    }))
  )
);

// ─── Connect and seed ─────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    const deleted = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing product(s)\n`);

    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seeded ${inserted.length} products:\n`);

    const summary = {};
    inserted.forEach(p => {
      summary[p.category] = (summary[p.category] || 0) + 1;
    });
    Object.entries(summary).forEach(([cat, count]) => {
      console.log(`   ${cat.padEnd(12)} — ${count} products`);
    });

    console.log("\n🎉 Done! Your products are in MongoDB.");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();