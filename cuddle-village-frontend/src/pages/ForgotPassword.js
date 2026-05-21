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

  // Step 1 — request OTP
  const [email,       setEmail]       = useState("");
  const [step,        setStep]        = useState(1); // 1 = email, 2 = otp + new password
  const [sending,     setSending]     = useState(false);
  const [sendError,   setSendError]   = useState("");

  // Step 2 — verify OTP + set new password
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

  // ── Step 1: request OTP ───────────────────────────────────────────────────
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
    catch { /* silent — same privacy response either way */ }
    setResending(false);
  };

  // ── Step 2: verify OTP + set new password ────────────────────────────────
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
        .fp-page  { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .fp-card  { background:#fff; border-radius:20px; box-shadow:0 8px 40px rgba(175,167,231,0.15); padding:40px 36px; width:100%; max-width:420px; }
        .fp-title { font-size:24px; font-weight:900; color:#2d2640; margin:0 0 6px; }
        .fp-sub   { font-size:14px; color:#999; margin:0 0 28px; line-height:1.5; }
        .fp-label { display:block; font-size:11px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.6px; margin:16px 0 6px; }
        .fp-input { width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid #e8e4f8; background:#faf9fe; font-size:14px; font-family:'Nunito',sans-serif; font-weight:600; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
        .fp-input:focus { border-color:#afa7e7; }
        .fp-input-wrap { position:relative; }
        .fp-input-wrap .fp-input { padding-right:44px; }
        .fp-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#bbb; padding:0; display:flex; align-items:center; transition:color 0.2s; }
        .fp-eye:hover { color:#8b7fd4; }
        .fp-otp  { width:100%; padding:14px; border-radius:12px; border:1.5px solid #e8e4f8; background:#faf9fe; font-size:24px; font-family:'Courier New',monospace; font-weight:900; letter-spacing:10px; text-align:center; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
        .fp-otp:focus { border-color:#afa7e7; background:#fff; }
        .fp-btn  { width:100%; margin-top:20px; padding:13px; background:linear-gradient(135deg,#C3B1E1,#afa7e7); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; transition:opacity 0.2s; }
        .fp-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .fp-error  { color:#e74c3c; font-size:13px; margin:10px 0 0; font-weight:600; }
        .fp-back   { display:block; text-align:center; margin-top:18px; font-size:13px; font-weight:700; color:#afa7e7; text-decoration:none; }
        .fp-back:hover { text-decoration:underline; }
        .fp-resend { background:none; border:none; color:#afa7e7; font-size:13px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; padding:0; text-decoration:underline; }
        .fp-resend:disabled { opacity:0.5; cursor:not-allowed; }
        .pw-rules { list-style:none; padding:0; margin:8px 0 0; display:flex; flex-direction:column; gap:4px; }
        .pw-rule  { display:flex; align-items:center; gap:7px; font-size:12px; font-weight:700; }
        .pw-rule.met   { color:#16a34a; }
        .pw-rule.unmet { color:#bbb; }
        .step-dots { display:flex; gap:6px; justify-content:center; margin-bottom:24px; }
        .step-dot  { width:8px; height:8px; border-radius:50%; background:#e8e4f8; transition:background 0.3s; }
        .step-dot.active { background:#afa7e7; width:24px; border-radius:4px; }
        .success-wrap { text-align:center; }
        .success-wrap .icon { font-size:52px; margin-bottom:12px; }
        .success-wrap h2 { font-size:22px; font-weight:900; color:#2d2640; margin:0 0 8px; }
        .success-wrap p  { font-size:14px; color:#888; line-height:1.6; }
      `}</style>

      <div className="fp-page">
        <div className="fp-card">

          {done ? (
            <div className="success-wrap">
              <div className="icon">✅</div>
              <h2>Password updated!</h2>
              <p>You'll be redirected to the login page in a moment…</p>
            </div>
          ) : (
            <>
              {/* Step dots */}
              <div className="step-dots">
                <div className={`step-dot ${step === 1 ? "active" : ""}`} />
                <div className={`step-dot ${step === 2 ? "active" : ""}`} />
              </div>

              {/* ── Step 1: enter email ────────────────────────────────── */}
              {step === 1 && (
                <>
                  <h1 className="fp-title">Forgot password?</h1>
                  <p className="fp-sub">Enter your email and we'll send you a 6-digit reset code.</p>
                  <form onSubmit={handleRequest}>
                    <label className="fp-label">Email address</label>
                    <input className="fp-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                    {sendError && <p className="fp-error">{sendError}</p>}
                    <button className="fp-btn" type="submit" disabled={sending}>
                      {sending ? "Sending code…" : "Send reset code →"}
                    </button>
                  </form>
                  <Link to="/login" className="fp-back">← Back to login</Link>
                </>
              )}

              {/* ── Step 2: enter OTP + new password ──────────────────── */}
              {step === 2 && (
                <>
                  <h1 className="fp-title">Enter reset code</h1>
                  <p className="fp-sub">
                    We sent a 6-digit code to <strong>{email}</strong>.
                    Enter it below with your new password.
                  </p>
                  <form onSubmit={handleReset}>
                    <label className="fp-label">6-digit code</label>
                    <input
                      className="fp-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="––––––"
                      required
                    />

                    <label className="fp-label">New password</label>
                    <div className="fp-input-wrap">
                      <input className="fp-input" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a strong password" required />
                      <button type="button" className="fp-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                        {showPw ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                      </button>
                    </div>
                    {password && (
                      <ul className="pw-rules">
                        {RULES.map(r => (
                          <li key={r.label} className={`pw-rule ${r.check(password) ? "met" : "unmet"}`}>
                            {r.check(password) ? "✅" : "❌"} {r.label}
                          </li>
                        ))}
                      </ul>
                    )}

                    <label className="fp-label">Confirm new password</label>
                    <div className="fp-input-wrap">
                      <input className="fp-input" type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" required />
                      <button type="button" className="fp-eye" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                        {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                      </button>
                    </div>
                    {confirm && !pwMatch && <p className="fp-error" style={{ marginTop: 6 }}>Passwords do not match</p>}

                    {resetError && <p className="fp-error">{resetError}</p>}

                    <button className="fp-btn" type="submit" disabled={saving}>
                      {saving ? "Updating password…" : "Update password →"}
                    </button>
                  </form>

                  <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#aaa" }}>
                    Didn't get it?{" "}
                    <button className="fp-resend" onClick={handleResend} disabled={resending}>
                      {resending ? "Resending…" : "Resend code"}
                    </button>
                  </p>
                  <button className="fp-back" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => { setStep(1); setCode(""); setPassword(""); setConfirm(""); setResetError(""); }}>
                    ← Change email
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
