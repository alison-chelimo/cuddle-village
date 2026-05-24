const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");

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

exports.getAdvancedStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalOrders,
            paidOrders,
            avgOrderValueAgg,
            failedPayments,
            newCustomers,
            orderStatusAgg,
            topProductsAgg,
            customerGrowthAgg,
            dailyRevenueAgg,
            paymentMethodAgg,
            lowStockProducts,
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ paymentStatus: "paid" }),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, avg: { $avg: "$totalPrice" } } }
            ]),
            Order.countDocuments({ paymentStatus: "failed" }),
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $unwind: "$orderItems" },
                { $group: {
                    _id: "$orderItems.name",
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
                }},
                { $sort: { revenue: -1 } },
                { $limit: 5 }
            ]),
            User.aggregate([
                { $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ]),
            Order.aggregate([
                { $match: { paymentStatus: "paid", paidAt: { $gte: thirtyDaysAgo } } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                    revenue: { $sum: "$totalPrice" }
                }},
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
            ]),
            Product.find({ stock: { $lte: 5 } }).select("name stock category").sort({ stock: 1 }).lean()
        ]);

        // Fill daily revenue gaps (last 30 days, no holes)
        const dailyMap = {};
        dailyRevenueAgg.forEach(d => { dailyMap[d._id] = d.revenue; });
        const dailyRevenue = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dailyRevenue.push({ date: label, revenue: dailyMap[key] || 0 });
        }

        res.json({
            kpis: {
                avgOrderValue:         Math.round(avgOrderValueAgg[0]?.avg || 0),
                conversionRate:        totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
                newCustomersThisMonth: newCustomers,
                failedPayments,
            },
            orderStatusBreakdown: orderStatusAgg.map(s => ({ name: s._id,  value: s.count })),
            topProducts:          topProductsAgg.map(p => ({ name: p._id,   revenue: Math.round(p.revenue) })),
            customerGrowth:       customerGrowthAgg.map(m => ({
                name:      `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
                customers: m.count,
            })),
            dailyRevenue,
            paymentMethods:   paymentMethodAgg.map(p => ({ name: p._id || "Unknown", value: p.count })),
            lowStockProducts,
        });
    } catch (err) {
        console.error("Advanced stats error:", err);
        res.status(500).json({ message: "Failed to load advanced stats" });
    }
};

exports.getOrders = async (req, res) => {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
    const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid order status" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }
    const order = await Order.findByIdAndUpdate(
        new mongoose.Types.ObjectId(req.params.id),
        { status: req.body.status },
        { new: true }
    );
    res.json(order);
};
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["user", "admin", "facilitator"];
    if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const safeId = new mongoose.Types.ObjectId(req.params.id);
    const safeRole = role === "admin" ? "admin" : role === "facilitator" ? "facilitator" : "user";
    const user = await User.findByIdAndUpdate(safeId, { role: safeRole }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "A user with that email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), password: hashed,
      role: role || "user", phone, isVerified: true,
    });
    res.status(201).json({ message: "User created", user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};
