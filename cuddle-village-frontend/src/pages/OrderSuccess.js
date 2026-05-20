// OrderSuccess.jsx
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reference = searchParams.get("trxref"); // Paystack appends this
  const [status, setStatus] = useState("verifying"); // "verifying" | "paid" | "failed"

  useEffect(() => {
    if (!reference) return;
    API.get(`/paystack/verify/${reference}`)
      .then(({ data }) => setStatus(data.success ? "paid" : "failed"))
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <div style={{ padding: "60px", fontFamily: "Nunito, sans-serif" }}>
      {status === "verifying" && <p>⏳ Verifying your payment…</p>}

      {status === "paid" && (
        <>
          <h1 style={{ color: "#4CAF50" }}>✅ Payment Confirmed!</h1>
          <p style={{ fontSize: "16px", marginTop: "10px" }}>Thank you for your order!</p>
          {orderId && <p><strong>Order ID:</strong> #{orderId.slice(-6).toUpperCase()}</p>}
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