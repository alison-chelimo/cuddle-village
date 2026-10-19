const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    baseProduct: {
        type: String,
        default: null
    },
    brand: {
        type: String,
        default: null 
    },
    image: String,
    stock: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); 

productSchema.index(
    { baseProduct: 1, brand: 1 },
    { unique: true, partialFilterExpression: { baseProduct: { $type: "string" }, brand: { $type: "string" } } }
);

module.exports = mongoose.model("Product", productSchema);
