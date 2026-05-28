import React, { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";

const COUNTRY_CODES = [
  { code: "+254", label: "🇰🇪 +254 Kenya" },
  { code: "+255", label: "🇹🇿 +255 Tanzania" },
  { code: "+256", label: "🇺🇬 +256 Uganda" },
  { code: "+234", label: "🇳🇬 +234 Nigeria" },
  { code: "+27",  label: "🇿🇦 +27 South Africa" },
  { code: "+44",  label: "🇬🇧 +44 United Kingdom" },
  { code: "+1",   label: "🇺🇸 +1 USA/Canada" },
];

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
  });
  const [countryCode, setCountryCode] = useState("+254");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();
  const [touched, setTouched] = useState({});
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  const pwRules = [
    { label: "At least 8 characters",       met: form.password.length >= 8 },
    { label: "One uppercase letter",         met: /[A-Z]/.test(form.password) },
    { label: "One number",                   met: /[0-9]/.test(form.password) },
    { label: "One special character",        met: /[!@#$%^&*(),.?":{}|<>\-_]/.test(form.password) },
  ];
  const pwValid = pwRules.every(r => r.met);

  // Book-club enrollment toggle
  const [joinBookClub, setJoinBookClub] = useState(false);
  const [bookClub, setBookClub] = useState({
    childName: "", childAge: "", dob: "", school: "",
    allergies: "", specialNeeds: "",
    schedule: "", plan: "",
    emergencyContact: "",
    // group is derived from age, not selected manually
  });

  const handleChange      = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBookClub    = (e) => setBookClub({ ...bookClub, [e.target.name]: e.target.value });

  // Derive group from age
  const getGroup = (age) => {
    const n = parseInt(age, 10);
    if (n >= 4 && n <= 5) return "early-learners";
    if (n >= 6 && n <= 8) return "growing-readers";
    return undefined; // FIX 1: return undefined instead of null to avoid Mongoose enum rejection
  };
  const groupLabel = (age) => {
    const n = parseInt(age, 10);
    if (n >= 4 && n <= 5) return "🟡 Ages 4–5 · Early Learners";
    if (n >= 6 && n <= 8) return "🔵 Ages 6–8 · Growing Readers";
    if (age) return "⚠️ Book Club is for ages 4–8";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pwValid) return toast.error("Please meet all password requirements before continuing.");
    if (form.password !== confirmPassword) return toast.error("Passwords do not match.");

    if (joinBookClub) {
      if (!getGroup(bookClub.childAge)) return toast.error("Child age must be between 4 and 8 for the Book Club.");
      if (!bookClub.plan)     return toast.error("Please select a membership plan.");
      if (!bookClub.schedule) return toast.error("Please select a preferred schedule.");
    }

    setLoading(true);
    try {
      const phoneLocal = form.phone.replace(/^0/, "");
      const fullPhone = form.phone ? `${countryCode}${phoneLocal}` : "";
      const payload = {
        ...form,
        phone: fullPhone || undefined,
        ...(joinBookClub ? { bookClub: { ...bookClub, group: getGroup(bookClub.childAge) } } : {}),
      };

      await API.post("/auth/register", payload);

      toast.success("Account created! Check your email for a verification code.");
      localStorage.setItem("verifyEmail", form.email);

      if (joinBookClub) {
        const age = parseInt(bookClub.childAge, 10);
        localStorage.setItem("pendingBookClubAge", age); // store age for post-verify redirect
      }

      // After verification the server will know the group; redirect accordingly.
      window.location.href = "/verify";
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ageGroup = groupLabel(bookClub.childAge);
  // FIX 2: Parse age to number for chip comparison
  const parsedAge = parseInt(bookClub.childAge, 10);

  return (
    <>
      <Toast toasts={toasts} />
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

        /* Book-club info badge */
        .book-club-info {
          margin-top: 24px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(195,177,225,0.3);
          border-radius: 16px; padding: 18px 20px; width: 100%; text-align: left;
        }
        .book-club-info-title {
          font-size: 13px; font-weight: 900; letter-spacing: 0.5px;
          color: #C3B1E1; text-transform: uppercase; margin-bottom: 12px;
        }
        .group-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 10px;
        }
        .group-badge {
          display: inline-block;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 900; white-space: nowrap;
          flex-shrink: 0; margin-top: 1px;
        }
        .badge-yellow { background: #f7c94822; color: #f7c948; border: 1px solid #f7c94855; }
        .badge-blue   { background: #5bb8f522; color: #5bb8f5; border: 1px solid #5bb8f555; }
        .group-desc { font-size: 12px; font-weight: 600; color: #ccc; line-height: 1.5; }

        /* ── Right panel ────────────────────────────────────────────────── */
        .auth-right {
          background: #faf9fe;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 60px;
          overflow-y: auto;
        }
        .auth-form-card {
          background: #fff;
          border-radius: 24px; padding: 40px;
          width: 100%; max-width: 440px;
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
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 12px; font-weight: 800; color: #888;
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

        select.form-input { cursor: pointer; }

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

        .pw-rules { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 4px; }
        .pw-rule  { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; transition: color 0.2s; }
        .pw-rule.met   { color: #16a34a; }
        .pw-rule.unmet { color: #bbb; }

        .remember-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #666; font-weight: 600; cursor: pointer;
          margin-bottom: 20px;
        }
        .remember-label input[type="checkbox"] {
          accent-color: #afa7e7; width: 15px; height: 15px;
        }

        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #7c5cbf, #6040a8);
          color: #fff; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          transition: all 0.2s; font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(100,70,180,0.45);
          margin-bottom: 20px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(100,70,180,0.6);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-switch {
          text-align: center; font-size: 13px; color: #aaa; font-weight: 600;
        }
        .auth-switch a { color: #8b7fd4; font-weight: 800; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }

        .field-error { display: block; color: #e74c3c; font-size: 12px; font-weight: 700; margin-top: 5px; }
        .form-input.invalid { border-color: #e74c3c; background: #fff8f8; }
        .form-input.valid   { border-color: #16a34a; }

        .phone-row { display: flex; gap: 8px; }
        .cc-select {
          padding: 13px 10px; border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 700;
          background: #faf9fe; cursor: pointer; flex-shrink: 0; min-width: 130px;
          color: #2d2640; transition: all 0.2s;
        }
        .cc-select:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }

        /* ── Book-club section ──────────────────────────────────────────── */
        .section-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0 20px;
        }
        .divider-line { flex: 1; height: 1px; background: #f0eeff; }
        .divider-label {
          font-size: 11px; font-weight: 900; letter-spacing: 0.8px;
          text-transform: uppercase; color: #c3b1e1; white-space: nowrap;
        }

        .book-club-toggle {
          display: flex; align-items: center; justify-content: space-between;
          background: #faf9fe; border: 1.5px solid #e8e4f8;
          border-radius: 14px; padding: 14px 16px;
          margin-bottom: 16px; cursor: pointer;
          transition: all 0.2s;
        }
        .book-club-toggle:hover { border-color: #afa7e7; background: #f5f2ff; }
        .book-club-toggle-left { display: flex; align-items: center; gap: 10px; }
        .book-club-toggle-icon { font-size: 22px; }
        .book-club-toggle-text { font-size: 14px; font-weight: 800; color: #2d2640; }
        .book-club-toggle-sub  { font-size: 12px; font-weight: 600; color: #aaa; }

        /* Toggle pill switch */
        .toggle-pill {
          width: 44px; height: 24px;
          background: #e0daf5; border-radius: 12px;
          position: relative; transition: background 0.2s; flex-shrink: 0;
        }
        .toggle-pill.active { background: #afa7e7; }
        .toggle-pill::after {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
          background: #fff; border-radius: 50%;
          top: 3px; left: 3px;
          transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .toggle-pill.active::after { transform: translateX(20px); }

        /* Book-club fields panel */
        .book-club-fields {
          background: #faf9fe;
          border: 1.5px solid #e8e4f8;
          border-radius: 16px; padding: 20px;
          margin-bottom: 16px;
          animation: slideDown 0.25s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fields-section-title {
          font-size: 11px; font-weight: 900; letter-spacing: 0.8px;
          text-transform: uppercase; color: #8b7fd4;
          margin-bottom: 12px; margin-top: 4px;
        }

        /* Age-group indicator chip */
        .age-group-chip {
          display: inline-block;
          padding: 5px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 800;
          margin-bottom: 14px;
        }
        .chip-yellow { background: #fffbeb; color: #b8860b; border: 1px solid #f7c94888; }
        .chip-blue   { background: #eff8ff; color: #1a6fa8; border: 1px solid #5bb8f588; }
        .chip-warn   { background: #fff3f3; color: #c0392b; border: 1px solid #e8a0a0; }

        /* Plan cards */
        .plan-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .plan-card {
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          padding: 10px 8px; cursor: pointer; text-align: center;
          transition: all 0.2s; background: #fff;
        }
        .plan-card:hover { border-color: #afa7e7; background: #f5f2ff; }
        .plan-card.selected { border-color: #afa7e7; background: #f0eeff; }
        .plan-card-price { font-size: 13px; font-weight: 900; color: #2d2640; }
        .plan-card-label { font-size: 10px; font-weight: 700; color: #aaa; margin-top: 2px; }

        /* ── Responsive ─────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { padding: 40px 24px; }
          .auth-left::before { width: 150px; height: 150px; top: -40px; left: -40px; }
          .auth-brand-logo { font-size: 48px; }
          .auth-brand-name { font-size: 22px; }
          .auth-perk, .book-club-info { display: none; }
          .auth-right { padding: 32px 20px; align-items: center; }
          .auth-form-card { padding: 28px 20px; border-radius: 16px; }
          .auth-form-card h2 { font-size: 22px; }
          .form-row { grid-template-columns: 1fr; }
          .plan-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 400px) {
          .auth-right { padding: 20px 12px; }
          .auth-form-card { padding: 24px 16px; }
          .submit-btn { font-size: 14px; padding: 13px; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-brand-logo">🧸</div>
          <div className="auth-brand-name">The Cuddle Village</div>
          <div className="auth-brand-tagline">Baby · Books · Wellness</div>

          {[
            { icon: "🎁", text: "Exclusive deals for registered members" },
            { icon: "📦", text: "Track your orders in real time" },
            { icon: "❤️", text: "Save your favourites to a wishlist" },
          ].map((p, i) => (
            <div className="auth-perk" key={i}>
              <span className="auth-perk-icon">{p.icon}</span>
              {p.text}
            </div>
          ))}

          <div className="book-club-info">
            <div className="book-club-info-title">📚 Book Club Groups</div>
            <div className="group-row">
              <span className="group-badge badge-yellow">Ages 4–5</span>
              <div className="group-desc">
                <strong>Early Learners</strong> — Picture books, short stories & listening activities
              </div>
            </div>
            <div className="group-row">
              <span className="group-badge badge-blue">Ages 6–8</span>
              <div className="group-desc">
                <strong>Growing Readers</strong> — Storytelling, comprehension & discussion
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-card">
            <h2>Create Account ✨</h2>
            <p>Join The Cuddle Village today — it's free!</p>

            <form onSubmit={handleSubmit}>
              {/* ── Parent / Guardian details ─────────────────────── */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    name="name" placeholder="Jane Doe"
                    className={`form-input${touched.name ? (form.name.trim().length >= 2 ? " valid" : " invalid") : ""}`}
                    onChange={handleChange} onBlur={() => touch("name")} required
                  />
                  {touched.name && form.name.trim().length < 2 && (
                    <span className="field-error">Please enter your full name</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="phone-row">
                    <select className="cc-select" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                      {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <input
                      name="phone" placeholder="712 345 678"
                      className="form-input"
                      onChange={handleChange}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email" type="email" placeholder="you@example.com"
                  className={`form-input${touched.email ? (validateEmail(form.email) ? " valid" : " invalid") : ""}`}
                  onChange={handleChange} onBlur={() => touch("email")} required
                />
                {touched.email && !validateEmail(form.email) && (
                  <span className="field-error">Please enter a valid email address</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Choose a strong password"
                    className="form-input"
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <ul className="pw-rules">
                    {pwRules.map(r => (
                      <li key={r.label} className={`pw-rule ${r.met ? "met" : "unmet"}`}>
                        {r.met ? "✅" : "❌"} {r.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {confirmPassword && form.password !== confirmPassword && (
                  <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 700, marginTop: 6 }}>Passwords do not match</p>
                )}
              </div>

              <label className="remember-label">
                <input type="checkbox" onChange={() => setRemember(!remember)} />
                Remember me on this device
              </label>

              {/* ── Book-club enrolment section ───────────────────── */}
              <div className="section-divider">
                <div className="divider-line" />
                <div className="divider-label">Book Club (optional)</div>
                <div className="divider-line" />
              </div>

              {/* Toggle */}
              <div className="book-club-toggle" onClick={() => setJoinBookClub(!joinBookClub)}>
                <div className="book-club-toggle-left">
                  <span className="book-club-toggle-icon">📚</span>
                  <div>
                    <div className="book-club-toggle-text">Enrol a child in the Book Club</div>
                    <div className="book-club-toggle-sub">Ages 4–8 · Sat or Sun sessions</div>
                  </div>
                </div>
                <div className={`toggle-pill ${joinBookClub ? "active" : ""}`} />
              </div>

              {/* Expanded book-club fields */}
              {joinBookClub && (
                <div className="book-club-fields">

                  {/* Child info */}
                  <div className="fields-section-title">Child Information</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Child's Name</label>
                      <input name="childName" placeholder="e.g. Amara" className="form-input" onChange={handleBookClub} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input name="childAge" type="number" min="4" max="8" placeholder="4–8" className="form-input" onChange={handleBookClub} required />
                    </div>
                  </div>

                  {/* Auto group chip — FIX 2: use parsedAge for comparison */}
                  {ageGroup && (
                    <div className={`age-group-chip ${
                      parsedAge >= 4 && parsedAge <= 5 ? "chip-yellow"
                      : parsedAge >= 6 && parsedAge <= 8 ? "chip-blue"
                      : "chip-warn"
                    }`}>
                      {ageGroup}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input name="dob" type="date" className="form-input" onChange={handleBookClub} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">School (optional)</label>
                      <input name="school" placeholder="School name" className="form-input" onChange={handleBookClub} />
                    </div>
                  </div>

                  {/* Medical / special needs */}
                  <div className="fields-section-title" style={{ marginTop: 12 }}>Medical & Special Needs</div>
                  <div className="form-group">
                    <label className="form-label">Allergies (if any)</label>
                    <input name="allergies" placeholder="e.g. Peanuts — leave blank if none" className="form-input" onChange={handleBookClub} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special instructions</label>
                    <input name="specialNeeds" placeholder="Any special needs or notes" className="form-input" onChange={handleBookClub} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input name="emergencyContact" placeholder="Name & phone number" className="form-input" onChange={handleBookClub} />
                  </div>

                  {/* Schedule */}
                  <div className="fields-section-title" style={{ marginTop: 12 }}>Preferred Schedule</div>
                  <div className="form-group">
                    <select name="schedule" className="form-input" onChange={handleBookClub} defaultValue="">
                      <option value="" disabled>Choose a day…</option>
                      <option value="saturday">Saturday Sessions</option>
                      <option value="sunday">Sunday Sessions</option>
                    </select>
                  </div>

                  {/* Membership plan */}
                  <div className="fields-section-title" style={{ marginTop: 12 }}>Membership Plan</div>
                  <div className="plan-cards">
                    {[
                      { value: "per-session", price: "KSh 800", label: "Per Session" },
                      { value: "monthly",     price: "KSh 3,000", label: "Monthly" },
                      { value: "premium",     price: "Custom",    label: "Premium" },
                    ].map((plan) => (
                      <div
                        key={plan.value}
                        className={`plan-card ${bookClub.plan === plan.value ? "selected" : ""}`}
                        onClick={() => setBookClub({ ...bookClub, plan: plan.value })}
                      >
                        <div className="plan-card-price">{plan.price}</div>
                        <div className="plan-card-label">{plan.label}</div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>

              <div className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;