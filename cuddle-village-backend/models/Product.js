const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    stock: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); 

module.exports = mongoose.model("Product", productSchema);
