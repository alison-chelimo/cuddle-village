const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};

exports.getStats = async (req, res) => {
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
        users,
        orders,
        revenue: revenueAgg[0]?.total || 0
    });
};

exports.getOrders = async (req, res) => {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
    { status: req.body.status },
    { new: true }
    );
    res.json(order);
};