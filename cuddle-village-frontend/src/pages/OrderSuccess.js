// OrderSuccess.jsx
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useLoyalty } from "../context/LoyaltyContext";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId   = searchParams.get("orderId");
  const reference = searchParams.get("trxref");
  const [status, setStatus]     = useState("verifying");
  const [earnedPts, setEarned]  = useState(null);
  const { refresh: refreshLoyalty } = useLoyalty();

  useEffect(() => {
    if (!reference) return;
    API.get(`/paystack/verify/${reference}`)
      .then(({ data }) => {
        setStatus(data.success ? "paid" : "failed");
        if (data.success) {
          refreshLoyalty();
          // Show points earned (1 pt per KES 10)
          if (data.amount) setEarned(Math.floor(data.amount / 10));
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference, refreshLoyalty]);

  return (
    <div style={{ padding: "60px", fontFamily: "Nunito, sans-serif" }}>
      {status === "verifying" && <p>⏳ Verifying your payment…</p>}

      {status === "paid" && (
        <>
          <h1 style={{ color: "#4CAF50" }}>✅ Payment Confirmed!</h1>
          <p style={{ fontSize: "16px", marginTop: "10px" }}>Thank you for your order!</p>
          {orderId && <p><strong>Order ID:</strong> #{orderId.slice(-6).toUpperCase()}</p>}
          {earnedPts > 0 && (
            <p style={{ fontSize: "14px", color: "#8b7fd4", fontWeight: 700, marginTop: 8, background: "#f0eeff", padding: "10px 16px", borderRadius: 10, display: "inline-block" }}>
              ★ You earned <strong>{earnedPts} loyalty points</strong> on this order!
            </p>
          )}
        </>
      )}

      {status === "failed" && (
        <>
          <h1 style={{ color: "#e74c3c" }}>❌ Payment Failed</h1>
          <p>Something went wrong. Please try again or contact support.</p>
        </>
      )}

      <Link to="/orders" style={{ marginTop: "20px", display: "inline-block" }}>
        📦 View My Orders
      </Link>
    </div>
  );
}

export default OrderSuccess;