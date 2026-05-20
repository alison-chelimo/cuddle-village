import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

// Status → visual config
const STATUS_CONFIG = {
  pending:    { label: "Pending",    className: "badge-pending",    icon: "⏳" },
  processing: { label: "Processing", className: "badge-processing", icon: "🔄" },
  shipped:    { label: "Shipped",    className: "badge-shipped",    icon: "🚚" },
  delivered:  { label: "Delivered",  className: "badge-delivered",  icon: "✅" },
  cancelled:  { label: "Cancelled",  className: "badge-cancelled",  icon: "❌" },
};

// In Orders.jsx — when looking up the config, normalise to lowercase
// const statusCfg = STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending;

const PAYMENT_STATUS_CONFIG = {
  paid:    { label: "Paid",    className: "pay-paid",    icon: "✅" },
  unpaid:  { label: "Unpaid",  className: "pay-unpaid",  icon: "⏳" },
  failed:  { label: "Failed",  className: "pay-failed",  icon: "❌" },
  refunded:{ label: "Refunded",className: "pay-refunded",icon: "↩️" },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my"); // adjust endpoint if needed
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
          font-weight: 900;
          color: #2d2640;
          margin: 0 0 6px;
        }

        .orders-page > p {
          font-size: 14px;
          color: #aaa;
          margin: 0 0 32px;
        }

        /* ── Skeleton loader ─────────────────────────────────── */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 18px;
          height: 88px;
          margin-bottom: 14px;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Error banner ────────────────────────────────────── */
        .error-banner {
          background: #fff5f5;
          border: 1.5px solid #ffe0e0;
          color: #c0392b;
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Empty state ─────────────────────────────────────── */
        .empty-orders {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-orders .emoji { font-size: 60px; margin-bottom: 16px; }
        .empty-orders h3 { font-size: 20px; color: #888; font-weight: 800; margin-bottom: 8px; }
        .empty-orders p  { color: #bbb; font-size: 14px; margin-bottom: 24px; }

        .browse-btn {
          display: inline-flex;
          padding: 12px 28px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(175,167,231,0.4);
        }

        /* ── Order card ──────────────────────────────────────── */
        .order-card {
          background: #fff;
          border-radius: 18px;
          border: 1.5px solid #f0f0f0;
          margin-bottom: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .order-card:hover { box-shadow: 0 8px 28px rgba(175,167,231,0.12); border-color: #e4dffa; }

        /* Summary row — always visible */
        .order-summary-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 18px 20px;
          cursor: pointer;
          user-select: none;
        }

        @media (min-width: 600px) {
          .order-summary-row {
            grid-template-columns: 1fr auto auto;
          }
        }

        .order-meta { display: flex; flex-direction: column; gap: 3px; }

        .order-id {
          font-size: 11px;
          font-weight: 800;
          color: #afa7e7;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .order-date {
          font-size: 15px;
          font-weight: 800;
          color: #2d2640;
        }

        .order-count { font-size: 13px; color: #aaa; font-weight: 600; }

        .order-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }

        .order-total {
          font-size: 16px;
          font-weight: 900;
          color: #2d2640;
          white-space: nowrap;
        }

        .order-chevron {
          font-size: 12px;
          color: #ccc;
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .order-chevron.open { transform: rotate(180deg); }

        /* ── Badges ──────────────────────────────────────────── */
        .order-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
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

        /* ── Expanded items ──────────────────────────────────── */
        .order-detail {
          border-top: 1.5px solid #f4f4f4;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #555;
          gap: 8px;
        }

        .detail-item-name {
          font-weight: 700;
          color: #2d2640;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 65%;
        }

        .detail-item-price { font-weight: 700; white-space: nowrap; }

        .detail-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f4f4f4;
          font-size: 12px;
          color: #bbb;
          flex-wrap: wrap;
          gap: 8px;
        }

        .detail-footer strong { color: #2d2640; }
      `}</style>

      <div className="orders-page">
        <h1>My Orders</h1>
        <p>Track and manage your past purchases</p>

        {/* Loading */}
        {loading && (
          <>
            <div className="skeleton" />
            <div className="skeleton" style={{ opacity: 0.7 }} />
            <div className="skeleton" style={{ opacity: 0.4 }} />
          </>
        )}

        {/* Error */}
        {!loading && error && <div className="error-banner">⚠️ {error}</div>}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <div className="emoji">📦</div>
            <h3>No orders yet</h3>
            <p>Once you place an order, it will show up here.</p>
            <Link to="/products" className="browse-btn">Start Shopping</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.map((order) => {
          const statusCfg  = STATUS_CONFIG[order.status]         || STATUS_CONFIG.pending;
          const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;
          const isOpen     = expanded === order._id;
          const itemCount  = order.orderItems?.length ?? 0;

          return (
            <div className="order-card" key={order._id}>
              {/* ── Clickable summary row ── */}
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
                  {/* Payment status */}
                  <span className={`order-badge ${paymentCfg.className}`}>
                    {paymentCfg.icon} {paymentCfg.label}
                  </span>

                  {/* Order / delivery status — hidden on very small screens */}
                  <span className={`order-badge ${statusCfg.className}`} style={{ display: "none" }}
                    ref={el => { if (el) el.style.display = ""; }}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>

                  <span className="order-total">KES {order.totalPrice?.toLocaleString()}</span>
                </div>

                <span className={`order-chevron${isOpen ? " open" : ""}`}>▼</span>
              </div>

              {/* ── Expanded detail ── */}
              {isOpen && (
                <div className="order-detail">
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