import React, { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      if (remember) localStorage.setItem("rememberMe", "true");
      localStorage.setItem("user", JSON.stringify(user));

      // ── Book-club age-group redirect ──────────────────────────────────────
      // If the account is linked to a book-club child, route to the correct
      // group hub; otherwise fall through to the main shop.
      // safer extraction
      const group = user?.bookClub?.group;

      // Admin

      if (user.role === "admin") {
        navigate("/admin/admin-dashboard");
      }

      // Book club groups
      else if (group === "early-learners") {
        navigate("/book-club/early-learners");
      }
      else if (group === "growing-readers") {
        navigate("/book-club/growing-readers");
      }
      else if (group === "group3") {
        navigate("/book-club/group3");
      }

      // Generic book club member
      else if (group) {
        navigate("/book-club");
      }

      // Normal users
      else {
        navigate("/");
      }
    } catch (err) {  
      console.log(err.response);
      console.log(err.response?.data);
      const message = err.response?.data?.message || "Login failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .auth-page {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Left panel ─────────────────────────────────────────────────── */
        .auth-left {
          background: linear-gradient(135deg, #2d2640 0%, #3d3460 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(195,177,225,0.2), transparent);
          top: -80px; left: -80px;
          border-radius: 50%;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(251,196,171,0.15), transparent);
          bottom: -60px; right: -60px;
          border-radius: 50%;
        }
        .auth-brand-logo  { font-size: 72px; margin-bottom: 20px; }
        .auth-brand-name  { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
        .auth-brand-tagline { font-size: 14px; color: #bbb; margin-bottom: 40px; }

        .auth-perk {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 20px;
          margin-bottom: 12px;
          width: 100%;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #ddd;
        }
        .auth-perk-icon { font-size: 22px; flex-shrink: 0; }

        /* Book-club badge on the left panel */
        .book-club-badge {
          margin-top: 24px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(195,177,225,0.3);
          border-radius: 16px;
          padding: 16px 20px;
          width: 100%;
          text-align: left;
        }
        .book-club-badge-title {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #C3B1E1;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .book-club-group {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #eee;
          margin-bottom: 6px;
        }
        .group-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-yellow { background: #f7c948; }
        .dot-blue   { background: #5bb8f5; }

        /* ── Right panel ────────────────────────────────────────────────── */
        .auth-right {
          background: #faf9fe;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }
        .auth-form-card {
          background: #fff;
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 20px 60px rgba(175,167,231,0.15);
          border: 1.5px solid #f0f0f0;
        }
        .auth-form-card h2 {
          font-size: 26px; font-weight: 900;
          color: #2d2640; margin: 0 0 6px;
        }
        .auth-form-card > p {
          font-size: 14px; color: #aaa; margin: 0 0 28px;
        }

        /* ── Form elements ──────────────────────────────────────────────── */
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 12px; font-weight: 800;
          color: #888;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e8e4f8;
          border-radius: 12px;
          font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          transition: all 0.2s;
          box-sizing: border-box;
          background: #faf9fe;
        }
        .form-input:focus {
          outline: none;
          border-color: #afa7e7;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
        }
        .form-input::placeholder { color: #ccc; }

        .form-extras {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .remember-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #666; font-weight: 600; cursor: pointer;
        }
        .remember-label input[type="checkbox"] {
          accent-color: #afa7e7; width: 15px; height: 15px;
        }
        .forgot-link {
          font-size: 13px; color: #afa7e7;
          text-decoration: none; font-weight: 700;
        }
        .forgot-link:hover { text-decoration: underline; }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(175,167,231,0.4);
          margin-bottom: 20px;
          opacity: 1;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(175,167,231,0.5);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Book-club link inside the form card */
        .book-club-link-row {
          text-align: center;
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }
        .book-club-link-row p {
          font-size: 12px; color: #aaa; margin: 0 0 8px;
        }
        .book-club-btn {
          display: inline-block;
          padding: 8px 20px;
          background: #faf9fe;
          border: 1.5px solid #e8e4f8;
          border-radius: 10px;
          font-size: 13px; font-weight: 800;
          color: #8b7fd4; text-decoration: none;
          transition: all 0.2s;
        }
        .book-club-btn:hover { background: #f0eeff; border-color: #afa7e7; }

        .auth-switch {
          text-align: center; font-size: 13px; color: #aaa; font-weight: 600;
          margin-bottom: 16px;
        }
        .auth-switch a { color: #8b7fd4; font-weight: 800; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }

        /* ── Responsive ─────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left  { padding: 40px 24px; }
          .auth-left::before { width: 150px; height: 150px; top: -40px; left: -40px; }
          .auth-brand-logo { font-size: 48px; }
          .auth-brand-name { font-size: 22px; }
          .auth-perk { display: none; }
          .book-club-badge { display: none; }
          .auth-right { padding: 32px 20px; }
          .auth-form-card { padding: 28px 20px; border-radius: 16px; }
          .auth-form-card h2 { font-size: 22px; }
        }
        @media (max-width: 400px) {
          .auth-right { padding: 20px 12px; }
          .auth-form-card { padding: 24px 16px; }
          .submit-btn { font-size: 14px; padding: 13px; }
        }
        @media (max-width: 480px) {
          .form-extras { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-brand-logo">🧸</div>
          <div className="auth-brand-name">The Cuddle Village</div>
          <div className="auth-brand-tagline">Baby · Books · Wellness</div>

          {[
            { icon: "🚚", text: "Free shipping on orders over KES 2,000" },
            { icon: "✅", text: "Carefully curated, quality-verified products" },
            { icon: "💬", text: "Friendly support available 24/7" },
          ].map((p, i) => (
            <div className="auth-perk" key={i}>
              <span className="auth-perk-icon">{p.icon}</span>
              {p.text}
            </div>
          ))}

          {/* Book-club group info */}
          <div className="book-club-badge">
            <div className="book-club-badge-title">📚 Book Club Groups</div>
            <div className="book-club-group">
              <span className="group-dot dot-yellow" />
              Ages 4–5 · Early Learners
            </div>
            <div className="book-club-group">
              <span className="group-dot dot-blue" />
              Ages 6–8 · Growing Readers
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-card">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="form-input"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-extras">
                <label className="remember-label">
                  <input type="checkbox" onChange={() => setRemember(!remember)} />
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing in…" : "Login →"}
              </button>

              <div className="auth-switch">
                Don't have an account? <Link to="/register">Sign up</Link>
              </div>

              {/* Book-club shortcut */}
              <div className="book-club-link-row">
                <p>Joining the Book Club?</p>
                <Link to="/book-club/register" className="book-club-btn">
                  📚 Register a child
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;