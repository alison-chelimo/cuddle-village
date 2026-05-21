import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .fp-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .fp-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(175,167,231,0.15);
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
        }
        .fp-title { font-size: 26px; font-weight: 900; color: #2d2640; margin: 0 0 6px; }
        .fp-sub   { font-size: 14px; color: #999; margin: 0 0 28px; }
        .fp-label { display: block; font-size: 13px; font-weight: 700; color: #2d2640; margin-bottom: 6px; }
        .fp-input {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid #e8e4f8; background: #faf9fe;
          font-size: 14px; font-family: 'Nunito', sans-serif;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .fp-input:focus { border-color: #afa7e7; }
        .fp-btn {
          width: 100%; margin-top: 20px; padding: 13px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: opacity 0.2s;
        }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-error  { color: #e74c3c; font-size: 13px; margin-top: 10px; font-weight: 600; }
        .fp-back   { display: block; text-align: center; margin-top: 20px; font-size: 13px; font-weight: 700; color: #afa7e7; text-decoration: none; }
        .fp-back:hover { text-decoration: underline; }
        .fp-success { text-align: center; }
        .fp-success .icon { font-size: 52px; margin-bottom: 12px; }
        .fp-success h2 { font-size: 22px; font-weight: 900; color: #2d2640; margin: 0 0 8px; }
        .fp-success p  { font-size: 14px; color: #888; margin: 0 0 24px; line-height: 1.6; }
      `}</style>

      <div className="fp-page">
        <div className="fp-card">
          {sent ? (
            <div className="fp-success">
              <div className="icon">📬</div>
              <h2>Check your inbox</h2>
              <p>If <strong>{email}</strong> is registered, we've sent a password reset link. It expires in 1 hour.</p>
              <Link to="/login" className="fp-back">← Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="fp-title">Forgot password?</h1>
              <p className="fp-sub">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit}>
                <label className="fp-label">Email address</label>
                <input
                  className="fp-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                {error && <p className="fp-error">{error}</p>}
                <button className="fp-btn" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <Link to="/login" className="fp-back">← Back to login</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
