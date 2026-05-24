const router   = require("express").Router();
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const upload   = require("../middleware/upload");
const { protect, adminOnly }  = require("../middleware/authMiddleware");
const { productLimiter }      = require("../middleware/rateLimiter");

// CREATE product with image
router.post("/", productLimiter, protect, adminOnly, upload.single("image"), async (req, res) => {
    try {
  const product = await Product.create({
    name:        String(req.body.name        ?? ""),
    price:       Number(req.body.price)      || 0,
    description: String(req.body.description ?? ""),
    category:    String(req.body.category    ?? ""),
    stock:       parseInt(String(req.body.stock ?? 0), 10),
    image:       req.file?.path,
  });

  res.status(201).json(product);
} catch (error) {
  res.status(500).json({ message: "Error creating product", error });
}
});

// GET all products
router.get("/", productLimiter, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// UPDATE product
router.put("/:id", productLimiter, protect, adminOnly, upload.single("image"), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, price, description, category, stock } = req.body;
  const updateData = {};
  if (name        !== undefined) updateData.name        = String(name);
  if (price       !== undefined) updateData.price       = Number(price);
  if (description !== undefined) updateData.description = String(description);
  if (category    !== undefined) updateData.category    = String(category);
  if (stock       !== undefined) updateData.stock       = parseInt(String(stock), 10);
  if (req.file)                  updateData.image       = req.file.path;

  const product = await Product.findByIdAndUpdate(
    new mongoose.Types.ObjectId(req.params.id),
    updateData,
    { new: true }
  );

  res.json(product);
});

// DELETE product
router.delete("/:id", productLimiter, protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;