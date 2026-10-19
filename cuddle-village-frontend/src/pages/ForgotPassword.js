import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";

const RULES = [
  { label: "At least 8 characters",  check: (p) => p.length >= 8 },
  { label: "One uppercase letter",   check: (p) => /[A-Z]/.test(p) },
  { label: "One number",             check: (p) => /[0-9]/.test(p) },
  { label: "One special character",  check: (p) => /[!@#$%^&*(),.?":{}|<>\-_]/.test(p) },
];

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email,       setEmail]       = useState("");
  const [step,        setStep]        = useState(1);
  const [sending,     setSending]     = useState(false);
  const [sendError,   setSendError]   = useState("");

  const [code,        setCode]        = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resending,   setResending]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [resetError,  setResetError]  = useState("");
  const [done,        setDone]        = useState(false);

  const pwMet   = RULES.every(r => r.check(password));
  const pwMatch = password === confirm;

  const handleRequest = async (e) => {
    e.preventDefault();
    setSendError("");
    setSending(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setSendError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try { await API.post("/auth/forgot-password", { email }); }
    catch { /* silent */ }
    setResending(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError("");
    if (code.trim().length !== 6)  return setResetError("Enter the 6-digit code from your email.");
    if (!pwMet)                    return setResetError("Password doesn't meet all requirements.");
    if (!pwMatch)                  return setResetError("Passwords do not match.");
    setSaving(true);
    try {
      await API.post("/auth/reset-password", { email, code: code.trim(), password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setResetError(err.response?.data?.message || "Reset failed. The code may have expired.");
    } finally {
      setSaving(false);
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

        /* ── Left panel ── */
        .auth-left {
          background: linear-gradient(135deg, #2d2640 0%, #3d3460 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px; color: #fff; text-align: center;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(195,177,225,0.2), transparent);
          top: -80px; left: -80px; border-radius: 50%;
        }
        .auth-left::after {
          content: '';
          position: absolute; width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(251,196,171,0.15), transparent);
          bottom: -60px; right: -60px; border-radius: 50%;
        }
        .auth-brand-logo  { font-size: 72px; margin-bottom: 20px; }
        .auth-brand-name  { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
        .auth-brand-tagline { font-size: 14px; color: #bbb; margin-bottom: 40px; }

        .auth-perk {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.07);
          border-radius: 14px; padding: 14px 20px; margin-bottom: 12px;
          width: 100%; text-align: left;
          font-size: 14px; font-weight: 600; color: #ddd;
        }
        .auth-perk-icon { font-size: 22px; flex-shrink: 0; }

        /* ── Right panel ── */
        .auth-right {
          background: #faf9fe;
          display: flex; align-items: center; justify-content: center;
          padding: 60px;
        }
        .auth-form-card {
          background: #fff; border-radius: 24px; padding: 40px;
          width: 100%; max-width: 400px;
          box-shadow: 0 20px 60px rgba(175,167,231,0.15);
          border: 1.5px solid #f0f0f0;
        }
        .auth-form-card h2 {
          font-size: 24px; font-weight: 900; color: #2d2640; margin: 0 0 6px;
        }
        .auth-form-card > p {
          font-size: 14px; color: #aaa; margin: 0 0 24px; line-height: 1.5;
        }

        /* ── Form elements ── */
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block; font-size: 12px; font-weight: 800; color: #888;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
        }
        .form-input {
          width: 100%; padding: 13px 16px;
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          transition: all 0.2s; box-sizing: border-box; background: #faf9fe;
        }
        .form-input:focus {
          outline: none; border-color: #afa7e7; background: #fff;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
        }
        .form-input::placeholder { color: #ccc; }

        .input-wrap { position: relative; }
        .input-wrap .form-input { padding-right: 44px; }
        .eye-btn {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #bbb; padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #8b7fd4; }

        .otp-input {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 28px; font-family: 'Courier New', monospace; font-weight: 900;
          letter-spacing: 12px; text-align: center;
          background: #faf9fe; box-sizing: border-box;
          transition: all 0.2s;
        }
        .otp-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }

        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #7c5cbf, #6040a8);
          color: #fff; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          transition: all 0.2s; font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(100,70,180,0.45);
          margin-top: 6px; margin-bottom: 16px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(100,70,180,0.6);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .fp-error  { color: #e74c3c; font-size: 13px; margin: 8px 0 0; font-weight: 600; }
        .fp-back   { display: block; text-align: center; margin-top: 14px; font-size: 13px; font-weight: 700; color: #afa7e7; text-decoration: none; }
        .fp-back:hover { text-decoration: underline; }
        .fp-resend { background: none; border: none; color: #afa7e7; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; padding: 0; text-decoration: underline; }
        .fp-resend:disabled { opacity: 0.5; cursor: not-allowed; }

        .pw-rules { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 4px; }
        .pw-rule  { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; }
        .pw-rule.met   { color: #16a34a; }
        .pw-rule.unmet { color: #bbb; }

        .step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 24px; }
        .step-dot  { width: 8px; height: 8px; border-radius: 50%; background: #e8e4f8; transition: all 0.3s; }
        .step-dot.active { background: #7c5cbf; width: 24px; border-radius: 4px; }

        .success-wrap { text-align: center; }
        .success-wrap .icon { font-size: 52px; margin-bottom: 12px; }
        .success-wrap h2 { font-size: 22px; font-weight: 900; color: #2d2640; margin: 0 0 8px; }
        .success-wrap p  { font-size: 14px; color: #888; line-height: 1.6; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left  { padding: 40px 24px; }
          .auth-left::before { width: 150px; height: 150px; top: -40px; left: -40px; }
          .auth-brand-logo { font-size: 48px; }
          .auth-brand-name { font-size: 22px; }
          .auth-perk { display: none; }
          .auth-right { padding: 32px 20px; }
          .auth-form-card { padding: 28px 20px; border-radius: 16px; }
        }
        @media (max-width: 400px) {
          .auth-right { padding: 20px 12px; }
          .auth-form-card { padding: 24px 16px; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── Left Panel ── */}
        <div className="auth-left">
          <div className="auth-brand-logo">🧸</div>
          <div className="auth-brand-name">The Cuddle Village</div>
          <div className="auth-brand-tagline">Baby · Books · Wellness</div>

          {[
            { icon: "🔒", text: "Your account is protected with secure encryption" },
            { icon: "📧", text: "Reset codes are valid for 15 minutes only" },
            { icon: "🛡️", text: "We'll never ask for your password via email" },
          ].map((p, i) => (
            <div className="auth-perk" key={i}>
              <span className="auth-perk-icon">{p.icon}</span>
              {p.text}
            </div>
          ))}
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-right">
          <div className="auth-form-card">

            {done ? (
              <div className="success-wrap">
                <div className="icon">✅</div>
                <h2>Password updated!</h2>
                <p>You'll be redirected to the login page in a moment…</p>
              </div>
            ) : (
              <>
                <div className="step-dots">
                  <div className={`step-dot ${step === 1 ? "active" : ""}`} />
                  <div className={`step-dot ${step === 2 ? "active" : ""}`} />
                </div>

                {step === 1 && (
                  <>
                    <h2>Forgot password?</h2>
                    <p>Enter your email and we'll send you a 6-digit reset code.</p>
                    <form onSubmit={handleRequest}>
                      <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input
                          className="form-input"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      {sendError && <p className="fp-error">{sendError}</p>}
                      <button className="submit-btn" type="submit" disabled={sending}>
                        {sending ? "Sending code…" : "Send reset code →"}
                      </button>
                    </form>
                    <Link to="/login" className="fp-back">← Back to login</Link>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2>Enter reset code</h2>
                    <p>
                      We sent a 6-digit code to <strong>{email}</strong>. Enter it below with your new password.
                    </p>
                    <form onSubmit={handleReset}>
                      <div className="form-group">
                        <label className="form-label">6-digit code</label>
                        <input
                          className="otp-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={code}
                          onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="——————"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">New password</label>
                        <div className="input-wrap">
                          <input
                            className="form-input"
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Choose a strong password"
                            required
                          />
                          <button type="button" className="eye-btn" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                            {showPw ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                          </button>
                        </div>
                        {password && (
                          <ul className="pw-rules">
                            {RULES.map(r => (
                              <li key={r.label} className={`pw-rule ${r.check(password) ? "met" : "unmet"}`}>
                                {r.check(password) ? "✓" : "○"} {r.label}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm new password</label>
                        <div className="input-wrap">
                          <input
                            className="form-input"
                            type={showConfirm ? "text" : "password"}
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="Repeat your password"
                            required
                          />
                          <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                            {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                          </button>
                        </div>
                        {confirm && !pwMatch && (
                          <p className="fp-error" style={{ marginTop: 6 }}>Passwords do not match</p>
                        )}
                      </div>

                      {resetError && <p className="fp-error">{resetError}</p>}

                      <button className="submit-btn" type="submit" disabled={saving}>
                        {saving ? "Updating password…" : "Update password →"}
                      </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: 13, color: "#aaa" }}>
                      Didn't get it?{" "}
                      <button className="fp-resend" onClick={handleResend} disabled={resending}>
                        {resending ? "Resending…" : "Resend code"}
                      </button>
                    </p>
                    <button
                      className="fp-back"
                      style={{ background: "none", border: "none", cursor: "pointer", display: "block", width: "100%", textAlign: "center" }}
                      onClick={() => { setStep(1); setCode(""); setPassword(""); setConfirm(""); setResetError(""); }}
                    >
                      ← Change email
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
