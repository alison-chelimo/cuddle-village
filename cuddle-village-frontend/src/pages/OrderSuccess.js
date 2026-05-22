import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useLoyalty } from "../context/LoyaltyContext";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId   = searchParams.get("orderId");
  const reference = searchParams.get("trxref");
  const [status, setStatus]    = useState("verifying");
  const [earnedPts, setEarned] = useState(null);
  const [copied, setCopied]    = useState(false);
  const { refresh: refreshLoyalty } = useLoyalty();

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }
    API.get(`/paystack/verify/${reference}`)
      .then(({ data }) => {
        setStatus(data.success ? "paid" : "failed");
        if (data.success) {
          refreshLoyalty();
          if (data.amount) setEarned(Math.floor(data.amount / 10));
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference, refreshLoyalty]);

  // Timeout: if still verifying after 12s, show timeout message
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(prev => prev === "verifying" ? "timeout" : prev);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .os-page {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          background: linear-gradient(160deg, #f0edff 0%, #faf9fe 50%, #fff4f0 100%);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(20px, 5vw, 60px);
        }
        .os-card {
          background: #fff; border-radius: 24px;
          max-width: 500px; width: 100%;
          box-shadow: 0 24px 60px rgba(175,167,231,0.18);
          border: 1.5px solid #f0f0f0;
          padding: 44px 36px; text-align: center;
        }
        .os-icon-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(175,167,231,0.35);
        }
        .os-icon-ring.fail { background: linear-gradient(135deg,#fca5a5,#e74c3c); }
        .os-icon-ring.spin {
          background: linear-gradient(135deg,#f0edff,#e8e4f8);
          animation: os-spin 1.2s linear infinite;
        }
        @keyframes os-spin { to { transform: rotate(360deg); } }
        .os-title { font-size: 24px; font-weight: 900; color: #2d2640; margin: 0 0 6px; }
        .os-subtitle { font-size: 14px; color: #aaa; font-weight: 600; margin: 0 0 24px; }
        .os-order-id-row {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-bottom: 20px;
          background: #faf9fe; border: 1.5px solid #ede9f8;
          border-radius: 12px; padding: 10px 16px;
        }
        .os-order-id-label { font-size: 12px; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
        .os-order-id-value { font-size: 13px; font-weight: 900; color: #2d2640; font-family: monospace; }
        .os-copy-btn {
          background: none; border: none; cursor: pointer;
          font-size: 16px; padding: 2px 4px;
          color: #afa7e7; transition: transform 0.15s;
        }
        .os-copy-btn:hover { transform: scale(1.2); }
        .os-points-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; color: #8b7fd4; font-weight: 800;
          background: #f0eeff; padding: 10px 18px; border-radius: 12px;
          border: 1.5px solid #e8e4f8; margin-bottom: 24px;
        }
        .os-actions { display: flex; flex-direction: column; gap: 10px; }
        .os-btn-primary {
          display: block; padding: 13px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          text-decoration: none; font-family: 'Nunito', sans-serif;
          transition: opacity 0.2s;
        }
        .os-btn-primary:hover { opacity: 0.88; }
        .os-btn-secondary {
          display: block; padding: 13px;
          background: #f5f3ff; color: #8b7fd4;
          border: 1.5px solid #e8e4f8; border-radius: 14px;
          font-size: 15px; font-weight: 800;
          text-decoration: none; font-family: 'Nunito', sans-serif;
          transition: background 0.2s;
        }
        .os-btn-secondary:hover { background: #ede9f8; }
        .os-timeout-note {
          font-size: 13px; color: #888; font-weight: 600;
          margin-bottom: 20px; line-height: 1.6;
        }
        .os-verifying-text {
          font-size: 15px; font-weight: 700; color: #888; margin: 16px 0 24px;
        }
      `}</style>

      <div className="os-page">
        <div className="os-card">

          {status === "verifying" && (
            <>
              <div className="os-icon-ring spin">⌛</div>
              <div className="os-title">Verifying Payment</div>
              <div className="os-verifying-text">Please wait while we confirm your payment…</div>
            </>
          )}

          {status === "timeout" && (
            <>
              <div className="os-icon-ring" style={{ background: "linear-gradient(135deg,#fde68a,#f5c842)" }}>⏱️</div>
              <div className="os-title">Taking Longer Than Usual</div>
              <div className="os-timeout-note">
                Your payment may still be processing. Please check your email for a confirmation, or view your orders below.
              </div>
              <div className="os-actions">
                <Link to="/orders" className="os-btn-primary">📦 View My Orders</Link>
                <button className="os-btn-secondary" onClick={() => window.location.reload()}>🔄 Retry</button>
              </div>
            </>
          )}

          {status === "paid" && (
            <>
              <div className="os-icon-ring">🎉</div>
              <div className="os-title">Payment Confirmed!</div>
              <div className="os-subtitle">Thank you for your purchase. Your order is being prepared.</div>

              {orderId && (
                <div className="os-order-id-row">
                  <span className="os-order-id-label">Order ID</span>
                  <span className="os-order-id-value">#{orderId.slice(-8).toUpperCase()}</span>
                  <button className="os-copy-btn" onClick={handleCopy} title="Copy order ID">
                    {copied ? "✅" : "📋"}
                  </button>
                </div>
              )}

              {earnedPts > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <span className="os-points-badge">
                    ★ You earned <strong>{earnedPts} loyalty points</strong> on this order!
                  </span>
                </div>
              )}

              <div className="os-actions">
                <Link to="/orders" className="os-btn-primary">📦 View My Orders</Link>
                <Link to="/products" className="os-btn-secondary">🛍️ Continue Shopping</Link>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="os-icon-ring fail">❌</div>
              <div className="os-title">Payment Failed</div>
              <div className="os-subtitle">Something went wrong with your payment. Your card was not charged.</div>
              <div className="os-actions">
                <Link to="/checkout" className="os-btn-primary">🔄 Try Again</Link>
                <Link to="/contact-us" className="os-btn-secondary">💬 Contact Support</Link>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default OrderSuccess;
