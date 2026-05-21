import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const PIE_COLORS    = ["#afa7e7", "#FBC4AB", "#B5D99C", "#5bb8f5", "#f7c948", "#e87070"];
const STATUS_COLOR  = { pending: "#f7c948", processing: "#5bb8f5", shipped: "#afa7e7", delivered: "#B5D99C", cancelled: "#e87070" };
const TOOLTIP_STYLE = { background: "#2d2640", border: "none", borderRadius: 10, color: "#fff", fontFamily: "Nunito", fontSize: 13, fontWeight: 700 };
const LABEL_STYLE   = { color: "#afa7e7" };
const TICK_STYLE    = { fontFamily: "Nunito", fontSize: 12, fill: "#aaa" };

function ChartCard({ title, badge, children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", boxShadow: "0 4px 20px rgba(175,167,231,0.12)", border: "1.5px solid #f0edff", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: "#2d2640", margin: 0 }}>{title}</h2>
        {badge && <span style={{ background: "#f0edff", color: "#8b7fd4", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e8e4f8" }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function AdminDashboard() {
  const [stats,    setStats]    = useState({ users: 0, orders: 0, revenue: 0, chartData: [] });
  const [advanced, setAdvanced] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [basicRes, advRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/advanced-stats"),
        ]);
        setStats(basicRes.data);
        setAdvanced(advRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const kpi = advanced?.kpis || {};

  const statCards = [
    { label: "Total Users",          value: stats.users,                         emoji: "👥", color: "#f0edff", accent: "#afa7e7" },
    { label: "Total Orders",         value: stats.orders,                        emoji: "📦", color: "#fff4f0", accent: "#e8956d" },
    { label: "Revenue (KES)",        value: `${(stats.revenue || 0).toLocaleString()}`, emoji: "💰", color: "#f3fae8", accent: "#B5D99C" },
    { label: "Avg Order Value",      value: `KES ${(kpi.avgOrderValue || 0).toLocaleString()}`, emoji: "🧾", color: "#fffbeb", accent: "#b8860b" },
    { label: "Conversion Rate",      value: `${kpi.conversionRate || 0}%`,       emoji: "📈", color: "#f0f9ff", accent: "#1a6fa8" },
    { label: "New Customers",        value: kpi.newCustomersThisMonth || 0,      emoji: "🌟", color: "#fdf4ff", accent: "#9333ea" },
    { label: "Failed Payments",      value: kpi.failedPayments || 0,            emoji: "⚠️", color: "#fff3f3", accent: "#c0392b" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C3B1E1,#afa7e7)" }} />
          <p style={{ color: "#8b7fd4", fontWeight: 700, fontSize: 14, fontFamily: "Nunito" }}>Loading dashboard…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .dash * { font-family: 'Nunito', sans-serif; }
        .stat-card { border-radius: 20px; padding: 24px 20px; display: flex; align-items: center; gap: 14px; transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.07); }
        .stat-emoji { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .chart-row  { display: grid; gap: 20px; margin-bottom: 20px; }
        .col-2      { grid-template-columns: 3fr 2fr; }
        .col-equal  { grid-template-columns: 1fr 1fr; }
        .col-1      { grid-template-columns: 1fr; }
        .stock-row  { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f3ff; font-size: 13px; font-weight: 700; color: #2d2640; }
        .stock-row:last-child { border-bottom: none; }
        .stock-cat  { font-size: 11px; color: #aaa; font-weight: 600; }
        @media (max-width: 900px) { .col-2, .col-equal { grid-template-columns: 1fr; } }
      `}</style>

      <AdminLayout>
        <div className="dash">

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0edff", border: "1.5px solid #e8e4f8", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#8b7fd4", marginBottom: 10 }}>
              ✨ Overview
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Admin Dashboard</h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0, fontWeight: 600 }}>Here's what's happening across the store.</p>
          </div>

          {/* ── KPI Cards ──────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 16, marginBottom: 24 }}>
            {statCards.map(card => (
              <div className="stat-card" key={card.label} style={{ background: card.color }}>
                <div className="stat-emoji">{card.emoji}</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, margin: 0, color: card.accent }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: Monthly Sales + Daily Revenue ───────────────── */}
          <div className="chart-row col-2" style={{ marginBottom: 20 }}>
            <ChartCard title="Monthly Sales" badge="Last 12 months">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.chartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0edff" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={TICK_STYLE} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} cursor={{ fill: "rgba(175,167,231,0.08)" }} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C3B1E1" />
                      <stop offset="100%" stopColor="#afa7e7" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="sales" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Daily Revenue" badge="Last 30 days">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={advanced?.dailyRevenue || []}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#afa7e7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#afa7e7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0edff" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ ...TICK_STYLE, fontSize: 10 }} interval={6} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
                  <Area type="monotone" dataKey="revenue" stroke="#afa7e7" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Row 3: Order Status + Payment Methods ──────────────── */}
          <div className="chart-row col-equal" style={{ marginBottom: 20 }}>
            <ChartCard title="Order Status Breakdown">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={advanced?.orderStatusBreakdown || []} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" paddingAngle={3}>
                    {(advanced?.orderStatusBreakdown || []).map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLOR[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, fontWeight: 700, fontFamily: "Nunito" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment Methods">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={advanced?.paymentMethods || []} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" paddingAngle={3}>
                    {(advanced?.paymentMethods || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, fontWeight: 700, fontFamily: "Nunito" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Row 4: Top 5 Products ───────────────────────────────── */}
          <div className="chart-row col-1" style={{ marginBottom: 20 }}>
            <ChartCard title="Top 5 Products by Revenue" badge="Paid orders">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={advanced?.topProducts || []} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0edff" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK_STYLE} />
                  <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ ...TICK_STYLE, fontSize: 12, fill: "#555" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
                  <Bar dataKey="revenue" fill="#FBC4AB" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Row 5: Customer Growth ──────────────────────────────── */}
          <div className="chart-row col-1" style={{ marginBottom: 20 }}>
            <ChartCard title="Customer Growth" badge="Last 12 months">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={advanced?.customerGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0edff" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ ...TICK_STYLE, fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
                  <Line type="monotone" dataKey="customers" stroke="#B5D99C" strokeWidth={3} dot={{ r: 4, fill: "#B5D99C", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Row 6: Low Stock Alert ──────────────────────────────── */}
          {advanced?.lowStockProducts?.length > 0 && (
            <ChartCard title="⚠️ Low Stock Alert" badge={`${advanced.lowStockProducts.length} products`}>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "0 0 8px", borderBottom: "2px solid #f5f3ff", fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <span>Product</span><span>Category</span><span>Stock</span>
                </div>
                {advanced.lowStockProducts.map(p => {
                  const bg = p.stock === 0 ? "#fff3f3" : p.stock <= 2 ? "#fff9eb" : "#fffdf5";
                  const color = p.stock === 0 ? "#c0392b" : p.stock <= 2 ? "#b8860b" : "#666";
                  return (
                    <div className="stock-row" key={p._id} style={{ background: bg, borderRadius: 8, padding: "10px 8px", marginTop: 4 }}>
                      <span>{p.name}</span>
                      <span className="stock-cat">{p.category || "—"}</span>
                      <span style={{ fontWeight: 900, color, background: bg, padding: "3px 10px", borderRadius: 20, fontSize: 13 }}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          )}

        </div>
      </AdminLayout>
    </>
  );
}

export default AdminDashboard;
