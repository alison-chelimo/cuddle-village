import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
  const { token }               = useParams();
  const navigate                = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .rp-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .rp-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(175,167,231,0.15);
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
        }
        .rp-title { font-size: 26px; font-weight: 900; color: #2d2640; margin: 0 0 6px; }
        .rp-sub   { font-size: 14px; color: #999; margin: 0 0 28px; }
        .rp-label { display: block; font-size: 13px; font-weight: 700; color: #2d2640; margin-bottom: 6px; margin-top: 16px; }
        .rp-input {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid #e8e4f8; background: #faf9fe;
          font-size: 14px; font-family: 'Nunito', sans-serif;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .rp-input:focus { border-color: #afa7e7; }
        .rp-btn {
          width: 100%; margin-top: 24px; padding: 13px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: opacity 0.2s;
        }
        .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .rp-error   { color: #e74c3c; font-size: 13px; margin-top: 10px; font-weight: 600; }
        .rp-back    { display: block; text-align: center; margin-top: 20px; font-size: 13px; font-weight: 700; color: #afa7e7; text-decoration: none; }
        .rp-back:hover { text-decoration: underline; }
        .rp-success { text-align: center; }
        .rp-success .icon { font-size: 52px; margin-bottom: 12px; }
        .rp-success h2 { font-size: 22px; font-weight: 900; color: #2d2640; margin: 0 0 8px; }
        .rp-success p  { font-size: 14px; color: #888; line-height: 1.6; }
      `}</style>

      <div className="rp-page">
        <div className="rp-card">
          {done ? (
            <div className="rp-success">
              <div className="icon">✅</div>
              <h2>Password updated!</h2>
              <p>You'll be redirected to the login page in a moment…</p>
            </div>
          ) : (
            <>
              <h1 className="rp-title">Reset password</h1>
              <p className="rp-sub">Choose a new password for your account.</p>
              <form onSubmit={handleSubmit}>
                <label className="rp-label">New password</label>
                <input
                  className="rp-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
                <label className="rp-label">Confirm password</label>
                <input
                  className="rp-input"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
                {error && <p className="rp-error">{error}</p>}
                <button className="rp-btn" type="submit" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
              <Link to="/login" className="rp-back">← Back to login</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
