const router   = require("express").Router();
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const upload   = require("../middleware/upload");
const { protect, adminOnly }  = require("../middleware/authMiddleware");
const { productLimiter }      = require("../middleware/rateLimiter");

// TODO: Existing MongoDB products will have baseProduct as null after deploy.
// A one-off backfill script matching product.name against CATALOG entries may be needed.
// Ask for confirmation before writing/running that script.

// CREATE product with image
router.post("/", productLimiter, protect, adminOnly, upload.single("image"), async (req, res) => {
    try {
  const product = await Product.create({
    name:        String(req.body.name        ?? ""),
    price:       Number(req.body.price)      || 0,
    description: String(req.body.description ?? ""),
    category:    String(req.body.category    ?? ""),
    baseProduct: req.body.baseProduct !== undefined && req.body.baseProduct !== ""
      ? String(req.body.baseProduct)
      : null,
    brand: req.body.brand !== undefined && req.body.brand !== ""
      ? String(req.body.brand)
      : null,
    stock:       parseInt(String(req.body.stock ?? 0), 10),
    image:       req.file?.path,
  });

  res.status(201).json(product);
} catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({ message: "This brand already exists for this base product" });
  }
  res.status(500).json({ message: "Error creating product", error });
}
});

// GET all products
router.get("/", productLimiter, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get("/:id", productLimiter, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Product not found" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// UPDATE product
router.put("/:id", productLimiter, protect, adminOnly, upload.single("image"), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, price, description, category, baseProduct, brand, stock } = req.body;

  // Use findById + save() so user-supplied values go through Mongoose schema
  // validation rather than a raw MongoDB update document (avoids taint into query args).
  const product = await Product.findById(new mongoose.Types.ObjectId(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (name        !== undefined) product.name        = String(name);
  if (price       !== undefined) product.price       = Number(price);
  if (description !== undefined) product.description = String(description);
  if (category    !== undefined) product.category    = String(category);
  if (baseProduct !== undefined) product.baseProduct = baseProduct === "" ? null : String(baseProduct);
  if (brand       !== undefined) product.brand       = brand === "" ? null : String(brand);
  if (stock       !== undefined) product.stock       = parseInt(String(stock), 10);
  if (req.file)                  product.image       = req.file.path;

  const updated = await product.save();
  res.json(updated);
});

// DELETE product
router.delete("/:id", productLimiter, protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;