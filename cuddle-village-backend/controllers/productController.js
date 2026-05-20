const Product = require("../models/Product");

// GET all products
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// CREATE product
exports.createProduct = async (req, res) => {
  const { name, price } = req.body;

  const product = await Product.create({ name, price });

  res.json(product);
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};