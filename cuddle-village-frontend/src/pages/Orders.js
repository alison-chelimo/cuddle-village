import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: "⏳", className: "badge-pending",    desc: "Order placed" },
  processing: { label: "Processing", icon: "🔄", className: "badge-processing", desc: "Being prepared" },
  shipped:    { label: "Shipped",    icon: "📦", className: "badge-shipped",    desc: "On the way" },
  delivered:  { label: "Delivered",  icon: "✅", className: "badge-delivered",  desc: "Delivered" },
  cancelled:  { label: "Cancelled",  icon: "❌", className: "badge-cancelled",  desc: "Cancelled" },
};

const PAYMENT_STATUS_CONFIG = {
  paid:     { label: "Paid",     className: "pay-paid",     icon: "✅" },
  unpaid:   { label: "Unpaid",   className: "pay-unpaid",   icon: "⏳" },
  failed:   { label: "Failed",   className: "pay-failed",   icon: "❌" },
  refunded: { label: "Refunded", className: "pay-refunded", icon: "↩️" },
};

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div style={{
        background: "#fff5f5", border: "1.5px solid #ffe0e0", borderRadius: 10,
        padding: "10px 16px", fontSize: 13, fontWeight: 700, color: "#c0392b",
        marginBottom: 16,
      }}>
        ❌ This order was cancelled
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative",
      }}>
        {/* Connecting line behind the dots */}
        <div style={{
          position: "absolute", top: 16, left: "10%", right: "10%",
          height: 3, background: "#f0eeff", borderRadius: 3, zIndex: 0,
        }} />
        <div style={{
          position: "absolute", top: 16, left: "10%",
          width: `${Math.max(0, (currentIdx / (STATUS_STEPS.length - 1)) * 80)}%`,
          height: 3, background: "#8b7fd4", borderRadius: 3, zIndex: 1,
          transition: "width 0.5s ease",
        }} />

        {STATUS_STEPS.map((step, idx) => {
          const done    = idx <= currentIdx;
          const active  = idx === currentIdx;
          const cfg     = STATUS_CONFIG[step];
          return (
            <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? "#8b7fd4" : "#f0eeff",
                border: `2.5px solid ${done ? "#8b7fd4" : "#d8d0f8"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: active ? 16 : 13,
                boxShadow: active ? "0 0 0 4px rgba(139,127,212,0.18)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>
                    {active ? cfg.icon : "✓"}
                  </span>
                ) : (
                  <span style={{ color: "#c8c0f0", fontSize: 11, fontWeight: 800 }}>{idx + 1}</span>
                )}
              </div>
              <div style={{
                marginTop: 6, fontSize: 10, fontWeight: 800,
                color: done ? "#8b7fd4" : "#ccc",
                textAlign: "center", textTransform: "uppercase", letterSpacing: "0.4px",
                lineHeight: 1.2,
              }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied]   = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my");
        setOrders(res.data || []);
      } catch (err) {
        setError("Could not load your orders. Please try again later.");
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const copyToClipboard = (text, id) => {
    if (!navigator.clipboard) {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // silently ignore if both APIs unavailable
      }
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      // clipboard permission denied — no feedback needed
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .orders-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          padding: 24px 16px;
        }
        @media (min-width: 640px) { .orders-page { padding: 40px 32px; } }
        @media (min-width: 900px) { .orders-page { padding: 40px 60px; } }

        .orders-page h1 {
          font-size: clamp(20px, 5vw, 28px);
          font-weight: 900; color: #2d2640; margin: 0 0 6px;
        }
        .orders-page > p { font-size: 14px; color: #aaa; margin: 0 0 32px; }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 18px; height: 88px; margin-bottom: 14px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .error-banner {
          background: #fff5f5; border: 1.5px solid #ffe0e0; color: #c0392b;
          border-radius: 12px; padding: 16px 20px; font-size: 14px; font-weight: 600;
        }

        .empty-orders { text-align: center; padding: 80px 20px; }
        .empty-orders .emoji { font-size: 60px; margin-bottom: 16px; }
        .empty-orders h3 { font-size: 20px; color: #888; font-weight: 800; margin-bottom: 8px; }
        .empty-orders p  { color: #bbb; font-size: 14px; margin-bottom: 24px; }

        .browse-btn {
          display: inline-flex; padding: 12px 28px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border-radius: 12px; font-size: 14px; font-weight: 700;
          text-decoration: none; box-shadow: 0 6px 18px rgba(175,167,231,0.4);
        }

        .order-card {
          background: #fff; border-radius: 18px; border: 1.5px solid #f0f0f0;
          margin-bottom: 14px; overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .order-card:hover { box-shadow: 0 8px 28px rgba(175,167,231,0.12); border-color: #e4dffa; }

        .order-summary-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px; align-items: center;
          padding: 18px 20px; cursor: pointer; user-select: none;
        }
        @media (min-width: 600px) {
          .order-summary-row { grid-template-columns: 1fr auto auto; }
        }

        .order-meta { display: flex; flex-direction: column; gap: 3px; }
        .order-id {
          font-size: 11px; font-weight: 800; color: #afa7e7;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .order-date { font-size: 15px; font-weight: 800; color: #2d2640; }
        .order-count { font-size: 13px; color: #aaa; font-weight: 600; }

        .order-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
        .order-total { font-size: 16px; font-weight: 900; color: #2d2640; white-space: nowrap; }

        .order-chevron { font-size: 12px; color: #ccc; transition: transform 0.2s; flex-shrink: 0; }
        .order-chevron.open { transform: rotate(180deg); }

        .order-badge {
          padding: 4px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 800; white-space: nowrap;
        }
        .badge-pending    { background: #fff8e8; color: #f5a623; }
        .badge-processing { background: #f0edff; color: #8b7fd4; }
        .badge-shipped    { background: #e8f4ff; color: #3b82f6; }
        .badge-delivered  { background: #e8f8e8; color: #4CAF50; }
        .badge-cancelled  { background: #f8e8e8; color: #e88; }

        .pay-paid     { background: #e8f8e8; color: #4CAF50; }
        .pay-unpaid   { background: #fff8e8; color: #f5a623; }
        .pay-failed   { background: #f8e8e8; color: #e88; }
        .pay-refunded { background: #f0edff; color: #8b7fd4; }

        .order-detail {
          border-top: 1.5px solid #f4f4f4;
          padding: 20px 20px 16px;
          display: flex; flex-direction: column; gap: 10px;
        }

        .tracking-banner {
          background: linear-gradient(135deg, #e8f4ff, #f0edff);
          border: 1.5px solid #c8e0f8; border-radius: 12px;
          padding: 14px 18px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .tracking-number {
          font-size: 15px; font-weight: 900; color: #1a6fa8;
          letter-spacing: 0.5px; font-family: 'Courier New', monospace;
        }
        .copy-btn {
          background: #fff; border: 1.5px solid #c8e0f8; border-radius: 8px;
          padding: 5px 12px; font-size: 11px; font-weight: 800; color: #1a6fa8;
          cursor: pointer; font-family: 'Nunito', sans-serif; white-space: nowrap;
          transition: all 0.2s;
        }
        .copy-btn:hover { background: #e8f4ff; }
        .copy-btn.copied { background: #edfaf4; border-color: #34c77b55; color: #1a7a4a; }

        .detail-item {
          display: flex; justify-content: space-between;
          align-items: center; font-size: 14px; color: #555; gap: 8px;
        }
        .detail-item-name {
          font-weight: 700; color: #2d2640; flex: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%;
        }
        .detail-item-price { font-weight: 700; white-space: nowrap; }

        .detail-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 12px; border-top: 1px solid #f4f4f4;
          font-size: 12px; color: #bbb; flex-wrap: wrap; gap: 8px;
        }
        .detail-footer strong { color: #2d2640; }
      `}</style>

      <div className="orders-page">
        <h1>My Orders</h1>
        <p>Track and manage your past purchases</p>

        {loading && (
          <>
            <div className="skeleton" />
            <div className="skeleton" style={{ opacity: 0.7 }} />
            <div className="skeleton" style={{ opacity: 0.4 }} />
          </>
        )}

        {!loading && error && <div className="error-banner">⚠️ {error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <div className="emoji">📦</div>
            <h3>No orders yet</h3>
            <p>Once you place an order, it will show up here.</p>
            <Link to="/products" className="browse-btn">Start Shopping</Link>
          </div>
        )}

        {!loading && !error && orders.map((order) => {
          const statusCfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;
          const isOpen     = expanded === order._id;
          const itemCount  = order.orderItems?.length ?? 0;
          const isCopied   = copied === order._id;

          return (
            <div className="order-card" key={order._id}>
              {/* Summary row */}
              <div
                className="order-summary-row"
                onClick={() => toggle(order._id)}
                role="button"
                aria-expanded={isOpen}
              >
                <div className="order-meta">
                  <span className="order-id">ORDER #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toDateString()}</span>
                  <span className="order-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                </div>

                <div className="order-right">
                  <span className={`order-badge ${paymentCfg.className}`}>
                    {paymentCfg.icon} {paymentCfg.label}
                  </span>
                  <span className={`order-badge ${statusCfg.className}`}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                  <span className="order-total">KES {order.totalPrice?.toLocaleString()}</span>
                </div>

                <span className={`order-chevron${isOpen ? " open" : ""}`}>▼</span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="order-detail">
                  {/* Status timeline */}
                  <StatusTimeline status={order.status} />

                  {/* Tracking number banner */}
                  {order.trackingNumber && (
                    <div className="tracking-banner">
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1a6fa8", letterSpacing: "0.5px", marginBottom: 4 }}>
                          📦 TRACKING NUMBER
                        </div>
                        <div className="tracking-number">{order.trackingNumber}</div>
                      </div>
                      <button
                        className={`copy-btn${isCopied ? " copied" : ""}`}
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(order.trackingNumber, order._id); }}
                      >
                        {isCopied ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  )}

                  {/* Items */}
                  {(order.orderItems || []).map((item, idx) => (
                    <div className="detail-item" key={item._id ?? idx}>
                      <span className="detail-item-name">
                        {item.name}
                        <span style={{ fontWeight: 400, color: "#aaa" }}> ×{item.qty}</span>
                      </span>
                      <span className="detail-item-price">
                        KES {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="detail-footer">
                    <span>
                      📍 {order.shippingAddress?.address}
                      {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                    </span>
                    {order.paymentReference && (
                      <span>Ref: <strong>{order.paymentReference}</strong></span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Orders;
