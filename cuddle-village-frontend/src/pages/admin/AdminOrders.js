import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [updatingId, setUpdatingId]   = useState(null);
  // trackingInput: { [orderId]: string }
  const [trackingInput, setTrackingInput] = useState({});
  // showTrackingRow: orderId currently showing the tracking input row
  const [showTrackingRow, setShowTrackingRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, trackingNumber) => {
    setUpdatingId(id);
    try {
      const payload = { status };
      if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
      await API.put(`/orders/${id}`, payload);
      setShowTrackingRow(null);
      setTrackingInput(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchOrders();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      alert(`Failed to update order: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusConfig = {
    pending:    { bg: "#fff8ec", color: "#d48a0a", border: "#f7c94855", dot: "#f7c948" },
    processing: { bg: "#f0edff", color: "#8b7fd4", border: "#afa7e755", dot: "#afa7e7" },
    shipped:    { bg: "#e8f4ff", color: "#1a6fa8", border: "#5bb8f555", dot: "#5bb8f5" },
    delivered:  { bg: "#edfaf4", color: "#1a7a4a", border: "#34c77b55", dot: "#34c77b" },
    cancelled:  { bg: "#fff3f3", color: "#c0392b", border: "#e8a0a055", dot: "#e87070" },
  };

  const getStatusStyle = (status) =>
    statusConfig[status?.toLowerCase()] || { bg: "#f5f5f5", color: "#888", border: "#ddd", dot: "#bbb" };

  const totalRevenue = orders
    .filter((o) => ["processing", "shipped", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .orders-wrap * { font-family: 'Nunito', sans-serif; }
        .orders-table-row { transition: background 0.15s; }
        .orders-table-row:hover { background: #f5f2ff !important; }

        .action-btn {
          border: none; border-radius: 8px; padding: 7px 14px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-process { background: #f0edff; color: #8b7fd4; border: 1.5px solid #afa7e755; }
        .btn-process:hover:not(:disabled) { background: #afa7e7; color: #fff; }
        .btn-ship    { background: #e8f4ff; color: #1a6fa8; border: 1.5px solid #5bb8f555; }
        .btn-ship:hover:not(:disabled)    { background: #5bb8f5; color: #fff; }
        .btn-deliver { background: #edfaf4; color: #1a7a4a; border: 1.5px solid #34c77b55; }
        .btn-deliver:hover:not(:disabled) { background: #34c77b; color: #fff; }
        .btn-cancel  { background: #fff3f3; color: #c0392b; border: 1.5px solid #e8a0a055; }
        .btn-cancel:hover:not(:disabled)  { background: #e87070; color: #fff; }
        .btn-confirm { background: #2d2640; color: #fff; border: 1.5px solid #2d2640; }
        .btn-confirm:hover:not(:disabled) { background: #3d3550; }

        .tracking-row td {
          padding: 10px 20px 14px !important;
          background: #f8f7ff !important;
          border-bottom: 2px solid #e8e4f8 !important;
        }
        .tracking-input-wrap {
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        }
        .tracking-input {
          flex: 1; min-width: 180px; padding: 8px 14px;
          border: 1.5px solid #d0c8f0; border-radius: 10px;
          font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif;
          color: #2d2640; outline: none;
        }
        .tracking-input:focus { border-color: #8b7fd4; box-shadow: 0 0 0 3px rgba(139,127,212,0.1); }
        .tracking-input::placeholder { color: #ccc; font-weight: 600; }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #e8e4f8; border-radius: 12px;
          padding: 9px 18px; font-size: 13px; font-weight: 800; color: #8b7fd4;
          cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; margin-bottom: 28px;
        }
        .back-btn:hover { background: #f0eeff; border-color: #afa7e7; transform: translateX(-2px); }

        .stat-mini {
          background: #fff; border-radius: 16px; padding: 20px 24px;
          border: 1.5px solid #f0edff; box-shadow: 0 4px 16px rgba(175,167,231,0.1);
          display: flex; align-items: center; gap: 14px;
        }
        .stat-mini-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        .tracking-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #e8f4ff; color: #1a6fa8;
          border: 1.5px solid #5bb8f530; border-radius: 8px;
          padding: 2px 8px; font-size: 11px; font-weight: 800;
          margin-top: 4px; letter-spacing: 0.3px;
        }

        /* Order card for mobile */
        .order-card {
          background: #fff; border-radius: 16px; padding: 18px 20px;
          border: 1.5px solid #f0edff; box-shadow: 0 2px 12px rgba(175,167,231,0.08);
          display: flex; flex-direction: column; gap: 14px;
        }
        .order-card-row {
          display: flex; justify-content: space-between; align-items: center; gap: 8px;
        }

        @media (max-width: 768px) {
          .orders-table-wrap { display: none !important; }
          .orders-cards-wrap { display: flex !important; }
          .stats-mini-grid { grid-template-columns: 1fr 1fr !important; }
          .orders-header h1 { font-size: 26px !important; }
        }
        @media (min-width: 769px) {
          .orders-cards-wrap { display: none !important; }
        }
      `}</style>

      <AdminLayout>
        <div className="orders-wrap">

          <button className="back-btn" onClick={() => navigate("/admin/admin-dashboard")}>
            ← Back to Dashboard
          </button>

          <div className="orders-header" style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0edff", border: "1.5px solid #e8e4f8",
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: "#8b7fd4",
              marginBottom: 10, letterSpacing: "0.5px",
            }}>
              📋 Order Management
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2d2640", margin: "0 0 6px" }}>
              All Orders
            </h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0, fontWeight: 600 }}>
              View and manage customer orders
            </p>
          </div>

          {/* Mini stats */}
          <div className="stats-mini-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16, marginBottom: 28,
          }}>
            {[
              { icon: "📋", label: "Total",      value: orders.length,                                                 bg: "#f0edff", color: "#8b7fd4" },
              { icon: "⏳", label: "Pending",     value: orders.filter(o => o.status === "pending").length,            bg: "#fff8ec", color: "#d48a0a" },
              { icon: "🔄", label: "Processing",  value: orders.filter(o => o.status === "processing").length,         bg: "#f0edff", color: "#8b7fd4" },
              { icon: "📦", label: "Shipped",     value: orders.filter(o => o.status === "shipped").length,            bg: "#e8f4ff", color: "#1a6fa8" },
              { icon: "✅", label: "Delivered",   value: orders.filter(o => o.status === "delivered").length,          bg: "#edfaf4", color: "#1a7a4a" },
              { icon: "💰", label: "Revenue",     value: `KES ${totalRevenue.toLocaleString()}`,                       bg: "#f3fae8", color: "#5a8a1a" },
            ].map((s) => (
              <div className="stat-mini" key={s.label}>
                <div className="stat-mini-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1.5px solid #f0edff",
            boxShadow: "0 4px 20px rgba(175,167,231,0.1)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "20px 24px", borderBottom: "1.5px solid #f0edff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#2d2640" }}>Order List</span>
              <span style={{
                background: "#f0edff", color: "#8b7fd4", fontSize: 12, fontWeight: 700,
                padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e8e4f8",
              }}>
                {orders.length} total
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#afa7e7", fontWeight: 700 }}>
                Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#bbb", fontWeight: 700 }}>
                No orders found
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="orders-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#faf9fe" }}>
                        {["Order ID", "Customer", "Items", "Total", "Status", "Actions"].map((h) => (
                          <th key={h} style={{
                            padding: "12px 20px", textAlign: "left", fontSize: 11,
                            fontWeight: 800, color: "#aaa", textTransform: "uppercase",
                            letterSpacing: "0.8px", borderBottom: "1.5px solid #f0edff", whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => {
                        const st = getStatusStyle(o.status);
                        const isUpdating = updatingId === o._id;
                        const statusLower = o.status?.toLowerCase();
                        const isShowingTracking = showTrackingRow === o._id;
                        return (
                          <React.Fragment key={o._id}>
                            <tr className="orders-table-row" style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}>
                              <td style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "#afa7e7", borderBottom: "1px solid #f5f3ff" }}>
                                <div>#{o._id?.slice(-6).toUpperCase()}</div>
                                {o.trackingNumber && (
                                  <div className="tracking-chip">📦 {o.trackingNumber}</div>
                                )}
                              </td>
                              <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640" }}>{o.user?.name || "Guest"}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa" }}>{o.user?.email}</div>
                              </td>
                              <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#666", borderBottom: "1px solid #f5f3ff" }}>
                                {o.orderItems?.length ?? "—"} item{o.orderItems?.length !== 1 ? "s" : ""}
                              </td>
                              <td style={{ padding: "14px 20px", fontSize: 15, fontWeight: 900, color: "#2d2640", borderBottom: "1px solid #f5f3ff" }}>
                                KES {(o.totalPrice || 0).toLocaleString()}
                              </td>
                              <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  background: st.bg, color: st.color, border: `1.5px solid ${st.border}`,
                                  borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 800,
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                                  {o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                                </span>
                              </td>
                              <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {statusLower === "pending" && (
                                    <button className="action-btn btn-process" disabled={isUpdating}
                                      onClick={() => updateStatus(o._id, "processing")}>🔄 Processing</button>
                                  )}
                                  {statusLower === "processing" && !isShowingTracking && (
                                    <button className="action-btn btn-ship" disabled={isUpdating}
                                      onClick={() => setShowTrackingRow(o._id)}>📦 Mark Shipped</button>
                                  )}
                                  {statusLower === "processing" && isShowingTracking && (
                                    <button className="action-btn btn-ship" disabled style={{ opacity: 0.5 }}>📦 Mark Shipped ↓</button>
                                  )}
                                  {statusLower === "shipped" && (
                                    <>
                                      <button className="action-btn btn-deliver" disabled={isUpdating}
                                        onClick={() => updateStatus(o._id, "delivered")}>✅ Delivered</button>
                                      {!isShowingTracking && (
                                        <button className="action-btn btn-ship" disabled={isUpdating}
                                          onClick={() => { setTrackingInput(prev => ({ ...prev, [o._id]: o.trackingNumber || "" })); setShowTrackingRow(o._id); }}>
                                          ✏️ Tracking
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {statusLower !== "delivered" && statusLower !== "cancelled" && (
                                    <button className="action-btn btn-cancel" disabled={isUpdating}
                                      onClick={() => { setShowTrackingRow(null); updateStatus(o._id, "cancelled"); }}>✕ Cancel</button>
                                  )}
                                  {(statusLower === "delivered" || statusLower === "cancelled") && (
                                    <span style={{ fontSize: 12, color: "#ccc", fontWeight: 700, padding: "7px 4px" }}>—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isShowingTracking && (
                              <tr className="tracking-row">
                                <td colSpan={6}>
                                  <div style={{ fontSize: 12, fontWeight: 800, color: "#8b7fd4", marginBottom: 8 }}>
                                    📦 Enter tracking number{statusLower === "shipped" ? " (update existing)" : " (required to mark as shipped)"}
                                  </div>
                                  <div className="tracking-input-wrap">
                                    <input className="tracking-input" type="text"
                                      placeholder="e.g. G4S-KE-12345, SENDY-67890"
                                      value={trackingInput[o._id] ?? ""}
                                      onChange={e => setTrackingInput(prev => ({ ...prev, [o._id]: e.target.value }))}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") updateStatus(o._id, "shipped", trackingInput[o._id] || null);
                                        if (e.key === "Escape") setShowTrackingRow(null);
                                      }}
                                      autoFocus
                                    />
                                    <button className="action-btn btn-confirm" disabled={isUpdating}
                                      onClick={() => updateStatus(o._id, "shipped", trackingInput[o._id] || null)}>
                                      {isUpdating ? "Saving…" : "Confirm"}
                                    </button>
                                    <button className="action-btn"
                                      style={{ background: "#f5f3ff", color: "#888", border: "1.5px solid #e0d9f7" }}
                                      onClick={() => setShowTrackingRow(null)}>Cancel</button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="orders-cards-wrap" style={{ flexDirection: "column", gap: 12, padding: 16 }}>
                  {orders.map((o) => {
                    const st = getStatusStyle(o.status);
                    const isUpdating = updatingId === o._id;
                    const statusLower = o.status?.toLowerCase();
                    return (
                      <div className="order-card" key={o._id}>
                        <div className="order-card-row">
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#afa7e7" }}>
                            #{o._id?.slice(-6).toUpperCase()}
                          </span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: st.bg, color: st.color, border: `1.5px solid ${st.border}`,
                            borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 800,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                            {o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                          </span>
                        </div>
                        <div className="order-card-row">
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640" }}>{o.user?.name || "Guest"}</div>
                            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{o.user?.email}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 15, fontWeight: 900, color: "#2d2640" }}>KES {(o.totalPrice || 0).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{o.orderItems?.length ?? 0} item{o.orderItems?.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {statusLower === "pending" && (
                            <button className="action-btn btn-process" disabled={isUpdating} onClick={() => updateStatus(o._id, "processing")}>🔄 Processing</button>
                          )}
                          {statusLower === "processing" && (
                            <button className="action-btn btn-ship" disabled={isUpdating} onClick={() => updateStatus(o._id, "shipped", null)}>📦 Mark Shipped</button>
                          )}
                          {statusLower === "shipped" && (
                            <button className="action-btn btn-deliver" disabled={isUpdating} onClick={() => updateStatus(o._id, "delivered")}>✅ Delivered</button>
                          )}
                          {statusLower !== "delivered" && statusLower !== "cancelled" && (
                            <button className="action-btn btn-cancel" disabled={isUpdating} onClick={() => updateStatus(o._id, "cancelled")}>✕ Cancel</button>
                          )}
                          {(statusLower === "delivered" || statusLower === "cancelled") && (
                            <span style={{ fontSize: 12, color: "#ccc", fontWeight: 700 }}>—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default AdminOrders;
