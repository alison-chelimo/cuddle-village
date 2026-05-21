import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Verify() {
  const [email, setEmail] = useState(localStorage.getItem("verifyEmail") || "");
  const [code, setCode] = useState("");

  // redirect after success
  const navigate = useNavigate();
  const handleVerify = async () => {
    try {
      const res = await API.post("/auth/verify", { email, code });
      alert(res.data.message || "Verified!");

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("verifyEmail");

      // Redirect Logic
      const group = user?.bookClub?.group;
      const age   = user?.bookClub?.childAge ? parseInt(user.bookClub.childAge, 10) : null;


      if(user.role === "admin") {
        navigate("/admin/admin-dashboard");
      }
      else if (group === "early-learners"){
        navigate("/book-club/early-learners");
      }
      else if (group === "growing-readers"){
        navigate("/book-club/growing-readers");
      }
      else if (user?.bookClub && age !== null && age > 8) {
        navigate("/book-club?status=coming-soon");      // ← new
      }
      else if (user?.bookClub && age !== null && age < 4) {
        navigate("/book-club?status=too-young");        // ← new
      }
      else if (user?.bookClub) {
        navigate("/book-club");
      }
      else {
        navigate("/");
      }

      
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed";
      alert(message);
    }
  };

  const handleResend = async () => {
    try {
      const res = await API.post("/auth/resend", { email });
      alert(res.data.message);
    } catch (err) {
      alert("Failed to resend code");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .verify-page {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0edff 0%, #faf9fe 50%, #fff4f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .verify-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px rgba(175,167,231,0.18);
          border: 1.5px solid #f0f0f0;
          text-align: center;
        }

        .verify-icon {
          font-size: 60px;
          margin-bottom: 16px;
          display: block;
        }

        .verify-card h2 {
          font-size: 26px;
          font-weight: 900;
          color: #2d2640;
          margin: 0 0 8px;
        }

        .verify-card p {
          font-size: 14px;
          color: #aaa;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .form-group {
          margin-bottom: 16px;
          text-align: left;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e8e4f8;
          border-radius: 12px;
          font-size: 14px;
          color: #2d2640;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
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

        .code-input {
          text-align: center;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 8px;
          color: #afa7e7;
        }

        .verify-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(175,167,231,0.4);
          margin-top: 8px;
        }

        .verify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(175,167,231,0.5);
        }

        .resend-link {
          display: block;
          margin-top: 16px;
          font-size: 13px;
          color: #aaa;
          font-weight: 600;
        }

        .resend-link a {
          color: #8b7fd4;
          font-weight: 800;
          text-decoration: none;
        }
      `}</style>

      <div className="verify-page">
        <div className="verify-card">
          <span className="verify-icon">📬</span>
          <h2>Check Your Email</h2>
          <p>We've sent a verification code to your email. Enter it below to activate your account.</p>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              placeholder="you@example.com"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              placeholder="_ _ _ _ _ _"
              className="form-input code-input"
              maxLength={6}
              onChange={e => setCode(e.target.value)}
            />
          </div>

          <button className="verify-btn" onClick={handleVerify}>
            Verify Account ✓
          </button>

          <div className="resend-link">
            Didn't get the code? <button onClick={handleResend} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>Resend</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Verify;