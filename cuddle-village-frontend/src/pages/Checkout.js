import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import API from "../services/api";

// Paystack inline JS is loaded once via a <script> tag in public/index.html:
// <script src="https://js.paystack.co/v1/inline.js"></script>

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Main checkout flow ──────────────────────────────────────────────────────
  const handleCheckout = async () => {
    setError("");

    if (!form.name || !form.email || !form.address) {
      setError("Please fill in your name, email and delivery address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the order in your backend
      const orderItems = cart.map((item) => ({
        product: item._id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image,
      }));

      const orderRes = await API.post("/orders", {
        orderItems,
        shippingAddress: { address: form.address, phone: form.phone, city: form.city || "" },
        totalPrice: total,
        paymentMethod: "paystack",
      });

      const order = orderRes.data;
      if (!order?._id) throw new Error("Order creation failed");

      // 2. Ask your backend to initialise a Paystack transaction
      const paystackRes = await API.post("/paystack/initialize", {
        email: form.email,
        amount: total,
        orderId: order._id,
        // Your frontend's success redirect (Paystack also calls your webhook)
        callbackUrl: `${window.location.origin}/order-success?orderId=${order._id}`,
      });

      const { authorization_url } = paystackRes.data;
      if (!authorization_url) throw new Error("Could not get Paystack authorization URL");

      setLoading(false);
      clearCart();

      // Redirect to Paystack hosted payment page
      window.location.href = authorization_url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || err.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .checkout-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          padding: 24px 16px;
        }

        .checkout-page h1 {
          font-size: clamp(20px, 5vw, 28px);
          font-weight: 900;
          color: #2d2640;
          margin-bottom: 24px;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 1100px;
          margin: 0 auto;
        }

        @media (min-width: 640px) { .checkout-page { padding: 32px; } }

        @media (min-width: 900px) {
          .checkout-page { padding: 40px 60px; }
          .checkout-layout { grid-template-columns: 1fr 360px; gap: 28px; align-items: start; }
        }

        .checkout-form-box,
        .checkout-summary {
          background: #fff;
          border-radius: 20px;
          padding: 24px 20px;
          border: 1.5px solid #f0f0f0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        @media (min-width: 900px) {
          .checkout-form-box,
          .checkout-summary { padding: 28px; }
          .checkout-summary { position: sticky; top: 24px; }
        }

        .checkout-form-box h3,
        .checkout-summary h3 {
          font-size: 16px;
          font-weight: 800;
          color: #2d2640;
          margin: 0 0 20px;
        }

        .form-group { margin-bottom: 16px; }

        .form-label {
          font-size: 11px;
          font-weight: 800;
          color: #888;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #e8e8e8;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: #2d2640;
          background: #faf9fe;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .form-input:focus {
          border-color: #7c5cbf;
          box-shadow: 0 0 0 3px rgba(124,92,191,0.12);
          background: #fff;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }

        @media (min-width: 480px) {
          .form-row { grid-template-columns: 1fr 1fr; gap: 14px; }
        }

        /* ── Payment methods strip ─────────────────────────────── */
        .payment-methods {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .pm-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f0edff;
          color: #7c5cbf;
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 700;
        }

        /* ── Summary ───────────────────────────────────────────── */
        .summary-items { margin-bottom: 16px; }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f4f4f4;
          font-size: 14px;
          color: #555;
        }

        .summary-item:last-child { border-bottom: none; }

        .summary-item-name {
          flex: 1;
          font-weight: 600;
          color: #2d2640;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
        }

        .summary-item-price { font-weight: 700; white-space: nowrap; }

        .summary-divider { height: 1.5px; background: #f0f0f0; margin: 12px 0; }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: 900;
          font-size: clamp(16px, 4vw, 18px);
          color: #2d2640;
        }

        /* ── CTA button ────────────────────────────────────────── */
        .checkout-btn {
          width: 100%;
          padding: 15px;
          margin-top: 20px;
          background: linear-gradient(135deg, #4CAF50 0%, #38a169 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(76,175,80,0.35);
        }

        .checkout-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(76,175,80,0.4);
        }

        .checkout-btn:active:not(:disabled) { transform: translateY(0); }

        .checkout-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error-banner {
          background: #fff5f5;
          border: 1.5px solid #ffe0e0;
          color: #c0392b;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .payment-note {
          margin-top: 14px;
          font-size: 12px;
          color: #aaa;
          text-align: center;
          line-height: 1.5;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
          color: #999;
          font-size: 15px;
        }
      `}</style>

      <div className="checkout-page">
        <h1>Checkout</h1>

        <div className="checkout-layout">

          {/* ── FORM ──────────────────────────────────────────────── */}
          <div className="checkout-form-box">
            <h3>📦 Delivery Details</h3>

            {error && <div className="error-banner">⚠️ {error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  name="name"
                  className="form-input"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="jane@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (optional)</label>
              <input
                name="phone"
                className="form-input"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <input
                name="address"
                className="form-input"
                placeholder="Street, building, estate…"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Town</label>
              <input
                name="city"
                className="form-input"
                placeholder="Nairobi"
                value={form.city}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </div>

            {/* Payment methods — all handled by Paystack, no selector needed */}
            <div className="form-group">
              <label className="form-label">Payment — accepted via Paystack</label>
              <div className="payment-methods">
                <span className="pm-badge">💳 Card</span>
                <span className="pm-badge">📱 M-Pesa</span>
                <span className="pm-badge">🏦 Bank Transfer</span>
                <span className="pm-badge">#️⃣ USSD</span>
              </div>
            </div>
          </div>

          {/* ── SUMMARY ───────────────────────────────────────────── */}
          <div className="checkout-summary">
            <h3>🛍️ Order Summary</h3>

            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item._id} className="summary-item">
                    <span className="summary-item-name">
                      {item.name}
                      <span style={{ fontWeight: 400, color: "#aaa" }}> ×{item.quantity}</span>
                    </span>
                    <span className="summary-item-price">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Setting up payment…" : "Place Order →"}
            </button>

            <p className="payment-note">
              A secure Paystack popup will open. Choose M-Pesa, card, bank transfer, or USSD.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Checkout;