import React, { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { SkeletonTable } from "../../components/Skeleton";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusConfig = {
  pending:    { bg: "#fff8ec", color: "#d48a0a", border: "#f7c94855", dot: "#f7c948" },
  processing: { bg: "#f0edff", color: "#8b7fd4", border: "#afa7e755", dot: "#afa7e7" },
  shipped:    { bg: "#e8f4ff", color: "#1a6fa8", border: "#5bb8f555", dot: "#5bb8f5" },
  delivered:  { bg: "#edfaf4", color: "#1a7a4a", border: "#34c77b55", dot: "#34c77b" },
  cancelled:  { bg: "#fff3f3", color: "#c0392b", border: "#e8a0a055", dot: "#e87070" },
};

const getStatusStyle = (status) =>
  statusConfig[status?.toLowerCase()] || { bg: "#f5f5f5", color: "#888", border: "#ddd", dot: "#bbb" };

function AdminOrders() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [draftStatus, setDraftStatus] = useState({});
  const [trackingInput, setTrackingInput] = useState({});
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const updateStatus = async (id) => {
    const newStatus = draftStatus[id];
    if (!newStatus) return;
    const tracking = trackingInput[id];
    setUpdatingId(id);
    try {
      const payload = { status: newStatus };
      if (newStatus === "shipped" && tracking !== undefined) payload.trackingNumber = tracking || null;
      await API.put(`/orders/${id}`, payload);
      setExpandedId(null);
      setDraftStatus(prev => { const n = { ...prev }; delete n[id]; return n; });
      setTrackingInput(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchOrders();
    } catch (err) {
      alert(`Failed to update order: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch =
        !q ||
        o._id?.slice(-6).toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const { page, setPage, totalPages, pageItems, resetPage } = usePagination(filtered, PAGE_SIZE);

  // Reset page when filters change
  const handleSearch = (v) => { setSearch(v); resetPage(); };
  const handleFilter = (v) => { setStatusFilter(v); resetPage(); };

  const totalRevenue = orders
    .filter(o => ["processing", "shipped", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const stats = [
    { label: "Total",      value: orders.length,                                               bg: "#f0edff", color: "#8b7fd4" },
    { label: "Pending",    value: orders.filter(o => o.status === "pending").length,            bg: "#fff8ec", color: "#d48a0a" },
    { label: "Processing", value: orders.filter(o => o.status === "processing").length,         bg: "#f0edff", color: "#8b7fd4" },
    { label: "Shipped",    value: orders.filter(o => o.status === "shipped").length,            bg: "#e8f4ff", color: "#1a6fa8" },
    { label: "Delivered",  value: orders.filter(o => o.status === "delivered").length,          bg: "#edfaf4", color: "#1a7a4a" },
    { label: "Revenue",    value: `KES ${totalRevenue.toLocaleString()}`,                       bg: "#f3fae8", color: "#5a8a1a" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .orders-wrap * { font-family: 'Nunito', sans-serif; }

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
          font-size: 13px; font-weight: 900; flex-shrink: 0; letter-spacing: 0;
        }

        .search-input {
          padding: 10px 14px; border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 600;
          background: #faf9fe; transition: all 0.2s; min-width: 220px;
        }
        .search-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }

        .filter-select {
          padding: 10px 14px; border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 700;
          background: #faf9fe; cursor: pointer; min-width: 150px; color: #2d2640;
        }
        .filter-select:focus { outline: none; border-color: #afa7e7; }

        .orders-table-row { transition: background 0.15s; cursor: pointer; }
        .orders-table-row:hover { background: #f5f2ff !important; }
        .orders-table-row.expanded-row { background: #f8f7ff !important; }

        .expand-panel td {
          padding: 0 !important;
          border-bottom: 2px solid #e8e4f8 !important;
        }
        .expand-inner {
          padding: 20px 24px;
          background: #f8f7ff;
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }
        @media (max-width: 900px) {
          .expand-inner { grid-template-columns: 1fr; }
        }

        .expand-section-title {
          font-size: 11px; font-weight: 900; color: #8b7fd4;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;
        }

        .status-select-row {
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        }
        .status-select {
          flex: 1; min-width: 140px; padding: 9px 14px;
          border: 1.5px solid #d0c8f0; border-radius: 10px;
          font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif;
          color: #2d2640; background: #fff; cursor: pointer;
        }
        .status-select:focus { outline: none; border-color: #8b7fd4; box-shadow: 0 0 0 3px rgba(139,127,212,0.1); }

        .tracking-input {
          flex: 1; min-width: 180px; padding: 9px 14px;
          border: 1.5px solid #d0c8f0; border-radius: 10px;
          font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif;
          color: #2d2640; outline: none; background: #fff;
        }
        .tracking-input:focus { border-color: #8b7fd4; box-shadow: 0 0 0 3px rgba(139,127,212,0.1); }
        .tracking-input::placeholder { color: #ccc; font-weight: 600; }

        .save-btn {
          padding: 9px 18px; background: #2d2640; color: #fff;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 800;
          cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.2s;
          white-space: nowrap;
        }
        .save-btn:hover:not(:disabled) { background: #3d3550; }
        .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .cancel-expand-btn {
          padding: 9px 14px; background: #f5f3ff; color: #888;
          border: 1.5px solid #e0d9f7; border-radius: 10px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }

        .audit-list { list-style: none; padding: 0; margin: 0; }
        .audit-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 8px 0; border-bottom: 1px solid #ede9f8;
          font-size: 12px; font-weight: 600; color: #666;
        }
        .audit-item:last-child { border-bottom: none; }
        .audit-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
        .audit-empty { font-size: 12px; color: #bbb; font-weight: 700; }

        .manage-btn {
          padding: 7px 14px; background: #f0edff; color: #8b7fd4;
          border: 1.5px solid #e8e4f8; border-radius: 8px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .manage-btn:hover { background: #afa7e7; color: #fff; }
        .manage-btn.open { background: #afa7e7; color: #fff; }

        .tracking-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #e8f4ff; color: #1a6fa8;
          border: 1.5px solid #5bb8f530; border-radius: 8px;
          padding: 2px 8px; font-size: 11px; font-weight: 800;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .orders-table-wrap { display: none !important; }
          .orders-cards-wrap { display: flex !important; }
          .stats-mini-grid { grid-template-columns: 1fr 1fr !important; }
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

          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0edff", border: "1.5px solid #e8e4f8",
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: "#8b7fd4",
              marginBottom: 10,
            }}>
              Order Management
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2d2640", margin: "0 0 6px" }}>All Orders</h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0, fontWeight: 600 }}>View and manage customer orders</p>
          </div>

          {/* Stats */}
          <div className="stats-mini-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16, marginBottom: 28,
          }}>
            {stats.map(s => (
              <div className="stat-mini" key={s.label}>
                <div className="stat-mini-icon" style={{ background: s.bg, color: s.color }}>{s.label[0]}</div>
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
            {/* Toolbar */}
            <div style={{
              padding: "20px 24px", borderBottom: "1.5px solid #f0edff",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <input
                className="search-input"
                placeholder="Search by ID, name or email…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => handleFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <span style={{
                marginLeft: "auto", background: "#f0edff", color: "#8b7fd4",
                fontSize: 12, fontWeight: 700, padding: "5px 12px",
                borderRadius: 20, border: "1.5px solid #e8e4f8",
              }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody><SkeletonTable rows={6} cols={6} /></tbody>
              </table>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#bbb", fontWeight: 700 }}>
                No orders match your search
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="orders-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#faf9fe" }}>
                        {["Order ID", "Customer", "Items", "Total", "Status", "Actions"].map(h => (
                          <th key={h} style={{
                            padding: "12px 20px", textAlign: "left", fontSize: 11,
                            fontWeight: 800, color: "#aaa", textTransform: "uppercase",
                            letterSpacing: "0.8px", borderBottom: "1.5px solid #f0edff", whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((o, i) => {
                        const st = getStatusStyle(o.status);
                        const isOpen = expandedId === o._id;
                        return (
                          <React.Fragment key={o._id}>
                            <tr
                              className={`orders-table-row${isOpen ? " expanded-row" : ""}`}
                              style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}
                              onClick={() => {
                                setExpandedId(isOpen ? null : o._id);
                                if (!isOpen) {
                                  setDraftStatus(prev => ({ ...prev, [o._id]: o.status }));
                                  setTrackingInput(prev => ({ ...prev, [o._id]: o.trackingNumber || "" }));
                                }
                              }}
                            >
                              <td style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "#afa7e7", borderBottom: "1px solid #f5f3ff" }}>
                                <div>#{o._id?.slice(-6).toUpperCase()}</div>
                                {o.trackingNumber && (
                                  <div className="tracking-chip">T: {o.trackingNumber}</div>
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
                                <button
                                  className={`manage-btn${isOpen ? " open" : ""}`}
                                  onClick={e => { e.stopPropagation(); setExpandedId(isOpen ? null : o._id); if (!isOpen) { setDraftStatus(prev => ({ ...prev, [o._id]: o.status })); setTrackingInput(prev => ({ ...prev, [o._id]: o.trackingNumber || "" })); } }}
                                >
                                  {isOpen ? "Close" : "Manage"}
                                </button>
                              </td>
                            </tr>

                            {isOpen && (
                              <tr className="expand-panel">
                                <td colSpan={6}>
                                  <div className="expand-inner">
                                    {/* Left: status update */}
                                    <div>
                                      <div className="expand-section-title">Update Status</div>
                                      <div className="status-select-row">
                                        <select
                                          className="status-select"
                                          value={draftStatus[o._id] || o.status}
                                          onChange={e => setDraftStatus(prev => ({ ...prev, [o._id]: e.target.value }))}
                                        >
                                          {STATUS_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                          ))}
                                        </select>
                                        <button
                                          className="save-btn"
                                          disabled={updatingId === o._id || draftStatus[o._id] === o.status}
                                          onClick={e => { e.stopPropagation(); updateStatus(o._id); }}
                                        >
                                          {updatingId === o._id ? "Saving…" : "Save"}
                                        </button>
                                        <button className="cancel-expand-btn" onClick={e => { e.stopPropagation(); setExpandedId(null); }}>
                                          Cancel
                                        </button>
                                      </div>

                                      {(draftStatus[o._id] === "shipped" || o.status === "shipped") && (
                                        <div style={{ marginTop: 12 }}>
                                          <div style={{ fontSize: 11, fontWeight: 800, color: "#8b7fd4", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Tracking Number
                                          </div>
                                          <input
                                            className="tracking-input"
                                            type="text"
                                            placeholder="e.g. G4S-KE-12345"
                                            value={trackingInput[o._id] ?? ""}
                                            onChange={e => setTrackingInput(prev => ({ ...prev, [o._id]: e.target.value }))}
                                            onClick={e => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    {/* Right: audit log */}
                                    <div>
                                      <div className="expand-section-title">Status History</div>
                                      {o.statusHistory?.length ? (
                                        <ul className="audit-list">
                                          {[...o.statusHistory].reverse().map((h, idx) => {
                                            const sc = getStatusStyle(h.status);
                                            return (
                                              <li key={idx} className="audit-item">
                                                <span className="audit-dot" style={{ background: sc.dot }} />
                                                <div>
                                                  <span style={{ fontWeight: 800, color: "#2d2640" }}>
                                                    {h.status?.charAt(0).toUpperCase() + h.status?.slice(1)}
                                                  </span>
                                                  {h.updatedByName && (
                                                    <span style={{ color: "#8b7fd4" }}> by {h.updatedByName}</span>
                                                  )}
                                                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
                                                    {new Date(h.updatedAt).toLocaleString("en-KE", {
                                                      day: "numeric", month: "short", year: "numeric",
                                                      hour: "2-digit", minute: "2-digit",
                                                    })}
                                                  </div>
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      ) : (
                                        <p className="audit-empty">No status changes recorded yet.</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>

                {/* Mobile cards */}
                <div className="orders-cards-wrap" style={{ flexDirection: "column", gap: 12, padding: 16 }}>
                  {pageItems.map((o) => {
                    const st = getStatusStyle(o.status);
                    const isOpen = expandedId === o._id;
                    return (
                      <div key={o._id} style={{
                        background: "#fff", borderRadius: 16, padding: "18px 20px",
                        border: "1.5px solid #f0edff", boxShadow: "0 2px 12px rgba(175,167,231,0.08)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#afa7e7" }}>#{o._id?.slice(-6).toUpperCase()}</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: st.bg, color: st.color, border: `1.5px solid ${st.border}`,
                            borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 800,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                            {o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640" }}>{o.user?.name || "Guest"}</div>
                            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{o.user?.email}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 15, fontWeight: 900, color: "#2d2640" }}>KES {(o.totalPrice || 0).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{o.orderItems?.length ?? 0} item{o.orderItems?.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                        <button
                          className={`manage-btn${isOpen ? " open" : ""}`}
                          style={{ width: "100%" }}
                          onClick={() => {
                            setExpandedId(isOpen ? null : o._id);
                            if (!isOpen) { setDraftStatus(prev => ({ ...prev, [o._id]: o.status })); setTrackingInput(prev => ({ ...prev, [o._id]: o.trackingNumber || "" })); }
                          }}
                        >
                          {isOpen ? "Close" : "Manage Order"}
                        </button>
                        {isOpen && (
                          <div style={{ marginTop: 14 }}>
                            <div className="expand-section-title">Update Status</div>
                            <div className="status-select-row" style={{ marginBottom: 12 }}>
                              <select
                                className="status-select"
                                value={draftStatus[o._id] || o.status}
                                onChange={e => setDraftStatus(prev => ({ ...prev, [o._id]: e.target.value }))}
                              >
                                {STATUS_OPTIONS.map(s => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                              <button
                                className="save-btn"
                                disabled={updatingId === o._id || draftStatus[o._id] === o.status}
                                onClick={() => updateStatus(o._id)}
                              >
                                {updatingId === o._id ? "Saving…" : "Save"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
