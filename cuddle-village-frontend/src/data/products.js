/**
 * products.js — The Cuddle Village product catalog
 *
 * Structure:
 *   CATEGORIES    — sidebar nav items  (id, label, emoji, slug)
 *   CATALOG       — full nested tree   (category → subcategory → products)
 *   FLAT_PRODUCTS — flat array the shop can use as a local fallback
 *                   before the backend seeds real products.
 *
 * When real images arrive:
 *   Add an `image` field (URL or import path) to each product entry.
 *   The placeholder logic in Products.jsx / ProductDetails.jsx checks
 *   `product.image` — if truthy it renders <img>, otherwise falls back
 *   to the emoji + name placeholder.
 */

export const CATEGORIES = [
  { id: "all",      slug: "all",       emoji: "🛍️",  label: "All Products"     },
  { id: "diaper",   slug: "diapering", emoji: "👶",   label: "Diapering"        },
  { id: "clothing", slug: "clothing",  emoji: "👕",   label: "Clothing"         },
  { id: "feeding",  slug: "feeding",   emoji: "🍼",   label: "Feeding"          },
  { id: "bath",     slug: "bath",      emoji: "🛁",   label: "Bath & Skincare"  },
  { id: "travel",   slug: "travel",    emoji: "🚼",   label: "Travel & Nursery" },
  { id: "toys",     slug: "toys",      emoji: "🧸",   label: "Toys"             },
  { id: "books",    slug: "books",     emoji: "📚",   label: "Books"            },
  { id: "gifts",    slug: "gifts",     emoji: "🎁",   label: "Gifts"            },
  { id: "health",   slug: "health",    emoji: "🩺",   label: "Health & Safety"  },
  { id: "mom",      slug: "mom",       emoji: "🤱",   label: "Mom & Maternity"  },
];

export const CATALOG = [
  {
    id: "diaper", label: "Diapering & Changing", emoji: "👶",
    subcategories: [
      {
        id: "diaper-disposable", label: "Disposable Diapers",
        products: [
          { name: "Newborn Diapers", size: "Newborn" },
          { name: "Small Diapers",   size: "S"       },
          { name: "Medium Diapers",  size: "M"       },
          { name: "Large Diapers",   size: "L"       },
          { name: "XL Diapers",      size: "XL"      },
        ],
      },
      {
        id: "diaper-misc", label: "Changing Essentials",
        products: [
          { name: "Training Pants"           },
          { name: "Baby Wipes (Single Pack)" },
          { name: "Baby Wipes (Bulk Pack)"   },
          { name: "Diaper Rash Cream"        },
          { name: "Changing Mat"             },
          { name: "Diaper Bin"               },
          { name: "Changing Bag"             },
        ],
      },
    ],
  },
  {
    id: "clothing", label: "Baby Clothing", emoji: "👕",
    subcategories: [
      {
        id: "clothing-newborn", label: "Newborn (0–3 months)",
        products: [
          { name: "Newborn Onesie"     },
          { name: "Newborn Romper"     },
          { name: "Newborn Sleep Suit" },
          { name: "Mittens & Booties"  },
          { name: "Newborn Cap"        },
        ],
      },
      {
        id: "clothing-infant", label: "Infant (3–12 months)",
        products: [
          { name: "Infant Bodysuit"  },
          { name: "Infant Dress"     },
          { name: "Two-Piece Set"    },
          { name: "Infant Jacket"    },
          { name: "Infant Sweater"   },
        ],
      },
      {
        id: "clothing-extras", label: "Extras",
        products: [
          { name: "Baby Socks"   },
          { name: "Swaddle Wrap" },
          { name: "Baby Blanket" },
        ],
      },
    ],
  },
  {
    id: "feeding", label: "Feeding Essentials", emoji: "🍼",
    subcategories: [
      {
        id: "feeding-bottles", label: "Bottles & Pumps",
        products: [
          { name: "Feeding Bottle (Small)"  },
          { name: "Feeding Bottle (Medium)" },
          { name: "Feeding Bottle (Large)"  },
          { name: "Manual Breast Pump"      },
          { name: "Electric Breast Pump"    },
          { name: "Bottle Sterilizer"       },
          { name: "Bottle Warmer"           },
        ],
      },
      {
        id: "feeding-mealtime", label: "Mealtime Essentials",
        products: [
          { name: "Baby Bib"          },
          { name: "Burp Cloth"        },
          { name: "Sippy Cup"         },
          { name: "Baby Spoon & Bowl" },
          { name: "High Chair"        },
        ],
      },
    ],
  },
  {
    id: "bath", label: "Bath & Skincare", emoji: "🛁",
    subcategories: [
      {
        id: "bath-cleansing", label: "Cleansing",
        products: [
          { name: "Baby Soap"    },
          { name: "Baby Shampoo" },
          { name: "Baby Lotion"  },
          { name: "Baby Oil"     },
          { name: "Baby Powder"  },
        ],
      },
      {
        id: "bath-accessories", label: "Bath Accessories",
        products: [
          { name: "Baby Towel"    },
          { name: "Baby Washcloth" },
          { name: "Baby Bathtub"  },
          { name: "Grooming Kit"  },
        ],
      },
    ],
  },
  {
    id: "travel", label: "Travel & Nursery", emoji: "🚼",
    subcategories: [
      {
        id: "travel-go", label: "On the Go",
        products: [
          { name: "Stroller"     },
          { name: "Car Seat"     },
          { name: "Baby Carrier" },
          { name: "Diaper Bag"   },
        ],
      },
      {
        id: "travel-nursery", label: "Nursery",
        products: [
          { name: "Baby Cot / Crib" },
          { name: "Crib Mattress"   },
          { name: "Bedding Set"     },
          { name: "Mosquito Net"    },
        ],
      },
    ],
  },
  {
    id: "toys", label: "Toys & Development", emoji: "🧸",
    subcategories: [
      {
        id: "toys-all", label: "All Toys",
        products: [
          { name: "Rattle"                    },
          { name: "Teething Toy"              },
          { name: "Activity Mat"              },
          { name: "Soft Toy"                  },
          { name: "Musical Toy"               },
          { name: "Educational Toy (0–5 yrs)" },
        ],
      },
    ],
  },
  {
    id: "books", label: "Books & Learning", emoji: "📚",
    subcategories: [
      {
        id: "books-0-3", label: "Ages 0–3",
        products: [
          { name: "Board Book"   },
          { name: "Sensory Book" },
        ],
      },
      {
        id: "books-4-8", label: "Ages 4–8",
        products: [
          { name: "Storybook"    },
          { name: "Picture Book" },
          { name: "Early Reader" },
        ],
      },
      {
        id: "books-learning", label: "Learning Materials",
        products: [
          { name: "Flashcards"             },
          { name: "Alphabet & Number Book" },
          { name: "Activity Book"          },
        ],
      },
    ],
  },
  {
    id: "gifts", label: "Gift Sets & Bundles", emoji: "🎁",
    subcategories: [
      {
        id: "gifts-all", label: "All Gift Sets",
        products: [
          { name: "Newborn Starter Pack"    },
          { name: "Baby Shower Gift Hamper" },
          { name: "Bath Time Kit"           },
          { name: "Feeding Kit"             },
          { name: "Monthly Baby Box"        },
        ],
      },
    ],
  },
  {
    id: "health", label: "Health & Safety", emoji: "🩺",
    subcategories: [
      {
        id: "health-all", label: "Health & Safety",
        products: [
          { name: "Thermometer"            },
          { name: "Baby First Aid Kit"     },
          { name: "Nasal Aspirator"        },
          { name: "Baby-Safe Detergent"    },
          { name: "Vitamins & Supplements" },
        ],
      },
    ],
  },
  {
    id: "mom", label: "Mom & Maternity", emoji: "🤱",
    subcategories: [
      {
        id: "mom-all", label: "Mom & Maternity",
        products: [
          { name: "Maternity Wear"      },
          { name: "Nursing Bra"         },
          { name: "Breastfeeding Cover" },
          { name: "Postnatal Care Kit"  },
          { name: "Nursing Pillow"      },
        ],
      },
    ],
  },
];

// ─── Flat product list ────────────────────────────────────────────────────────
// Used as a local fallback when the backend hasn't seeded products yet.
// price / image / description are null — fill them in as content is ready.
let _counter = 1;
export const FLAT_PRODUCTS = CATALOG.flatMap(cat =>
  cat.subcategories.flatMap(sub =>
    sub.products.map(p => ({
      _id:         String(_counter++),
      category:    cat.id,
      subcategory: sub.id,
      name:        p.name,
      size:        p.size ?? null,
      emoji:       cat.emoji,
      price:       null,
      image:       null,
      description: null,
    }))
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getCategoryEmoji(categoryId) {
  const cat = CATALOG.find(c => c.id === categoryId);
  return cat ? cat.emoji : "🛍️";
}

export function getCategoryLabel(categoryId) {
  const cat = CATALOG.find(c => c.id === categoryId);
  return cat ? cat.label : "Products";
}

export function getSubcategories(categoryId) {
  const cat = CATALOG.find(c => c.id === categoryId);
  return cat ? cat.subcategories : [];
}