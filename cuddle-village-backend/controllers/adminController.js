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

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

exports.getStats = async (req, res) => {
    const [users, orders, revenueAgg, monthlyAgg] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]),
        Order.aggregate([
            { $match: { paymentStatus: "paid", paidAt: { $exists: true } } },
            {
                $group: {
                    _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
                    sales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ])
    ]);

    const chartData = monthlyAgg.map(m => ({
        name: MONTH_NAMES[m._id.month - 1],
        sales: m.sales
    }));

    res.json({
        users,
        orders,
        revenue: revenueAgg[0]?.total || 0,
        chartData
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