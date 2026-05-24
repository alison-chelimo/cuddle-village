import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
  ];

  const statCards = [
    { label: "Total Users",  value: stats.users,                  emoji: "👥", color: "#f0edff", accent: "#afa7e7" },
    { label: "Total Orders", value: stats.orders,                 emoji: "📦", color: "#fff4f0", accent: "#e8956d" },
    { label: "Revenue",      value: `KES ${stats.revenue}`,       emoji: "💰", color: "#f3fae8", accent: "#B5D99C" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingDot} />
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .dashboard-wrap * { font-family: 'Nunito', sans-serif; }

        .stat-card {
          border-radius: 20px; padding: 28px 24px;
          display: flex; align-items: center; gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }

        .stat-emoji-box {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .dashboard-card-grid { grid-template-columns: 1fr !important; }
          .stat-card { padding: 20px 18px !important; }
          .stat-emoji-box { width: 44px !important; height: 44px !important; font-size: 22px !important; }
          .dashboard-title { font-size: 26px !important; }
          .chart-box { padding: 20px 16px !important; }
        }
      `}</style>

      <AdminLayout>
        <div className="dashboard-wrap">

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.badge}>✨ Overview</div>
            <h1 className="dashboard-title" style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stat Cards */}
          <div className="dashboard-card-grid" style={styles.cardGrid}>
            {statCards.map((card) => (
              <div className="stat-card" key={card.label} style={{ background: card.color }}>
                <div className="stat-emoji-box">{card.emoji}</div>
                <div>
                  <p style={styles.cardLabel}>{card.label}</p>
                  <p style={{ ...styles.cardValue, color: card.accent }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="chart-box" style={styles.chartBox}>
            <div style={styles.chartHeader}>
              <h2 style={styles.chartTitle}>Sales Overview</h2>
              <span style={styles.chartBadge}>Last 3 months</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0edff" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontFamily: "Nunito", fontSize: 13, fontWeight: 700, fill: "#888" }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontFamily: "Nunito", fontSize: 12, fill: "#aaa" }} />
                <Tooltip
                  cursor={{ fill: "rgba(175,167,231,0.08)" }}
                  contentStyle={{ background: "#2d2640", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "Nunito", fontSize: "13px", fontWeight: 700 }}
                  labelStyle={{ color: "#afa7e7" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="sales" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C3B1E1" />
                    <stop offset="100%" stopColor="#afa7e7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </AdminLayout>
    </>
  );
}

export default AdminDashboard;

const styles = {
  header:     { marginBottom: "32px" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "#f0edff", border: "1.5px solid #e8e4f8",
    borderRadius: "20px", padding: "6px 14px",
    fontSize: "12px", fontWeight: 700, color: "#8b7fd4",
    marginBottom: "10px", letterSpacing: "0.5px",
  },
  title:      { fontSize: "32px", fontWeight: 900, color: "#2d2640", margin: "0 0 6px" },
  subtitle:   { fontSize: "14px", color: "#888", margin: 0, fontWeight: 600 },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px", marginBottom: "28px",
  },
  cardLabel:  { fontSize: "12px", fontWeight: 700, color: "#888", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  cardValue:  { fontSize: "28px", fontWeight: 900, margin: 0 },
  chartBox: {
    background: "#fff", padding: "28px", borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(175,167,231,0.12)", border: "1.5px solid #f0edff",
  },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: 10 },
  chartTitle:  { fontSize: "18px", fontWeight: 900, color: "#2d2640", margin: 0 },
  chartBadge: {
    background: "#f0edff", color: "#8b7fd4", fontSize: "12px",
    fontWeight: 700, padding: "6px 14px", borderRadius: "20px", border: "1.5px solid #e8e4f8",
  },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" },
  loadingDot:  { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #C3B1E1, #afa7e7)" },
  loadingText: { color: "#8b7fd4", fontWeight: 700, fontSize: "14px" },
};