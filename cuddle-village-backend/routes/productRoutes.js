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
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    image: req.file?.path, // Cloudinary URL
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
  if (name        !== undefined) updateData.name        = name;
  if (price       !== undefined) updateData.price       = price;
  if (description !== undefined) updateData.description = description;
  if (category    !== undefined) updateData.category    = category;
  if (stock       !== undefined) updateData.stock       = stock;
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