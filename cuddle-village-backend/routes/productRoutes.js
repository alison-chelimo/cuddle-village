const router = require("express").Router();
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// CREATE product with image
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
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
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// UPDATE product
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  const updateData = {
    ...req.body,
  };

  if (req.file) {
    updateData.image = req.file.path;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  res.json(product);
});

// DELETE product
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;