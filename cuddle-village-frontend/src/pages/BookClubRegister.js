import React, { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

/**
 * BookClubRegister.jsx
 *
 * Standalone book-club enrolment page.
 * Mirrors The Cuddle Village Inc. – Book Club Registration Form (Word doc).
 * Accessible at /book-club/register
 *
 * Age-group routing after submission:
 *   Ages 4–5 → /book-club/early-learners
 *   Ages 6–8 → /book-club/growing-readers
 */

const PLANS = [
  { value: "per-session", price: "KSh 800",   label: "Per Session" },
  { value: "monthly",     price: "KSh 3,000", label: "Monthly" },
  { value: "premium",     price: "Custom",    label: "Premium Package" },
];

function BookClubRegister() {
  const [step, setStep] = useState(1); // 1 = child, 2 = parent, 3 = program
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Child info (Step 1)
  const [child, setChild] = useState({
    name: "", age: "", dob: "", school: "",
    allergies: "", specialNeeds: "",
  });

  // Parent / guardian info (Step 2)
  const [parent, setParent] = useState({
    name: "", phone: "", email: "", emergencyContact: "",
  });

  // Program selection (Step 3)
  const [program, setProgram] = useState({
    schedule: "", plan: "",
    consentGiven: false,
  });

  const handleChild   = (e) => setChild({ ...child, [e.target.name]: e.target.value });
  const handleParent  = (e) => setParent({ ...parent, [e.target.name]: e.target.value });
  // Derive group from age
  const age = parseInt(child.age, 10);
  const group = age >= 4 && age <= 5 ? "early-learners"
              : age >= 6 && age <= 8 ? "growing-readers"
              : null;

  const groupInfo = () => {
    if (!child.age) return null;
    if (age >= 4 && age <= 5) return { label: "🟡 Ages 4–5 · Early Learners", cls: "chip-yellow" };
    if (age >= 6 && age <= 8) return { label: "🔵 Ages 6–8 · Growing Readers", cls: "chip-blue" };
    return { label: "⚠️ Book Club is for ages 4–8 only", cls: "chip-warn" };
  };
  const gi = groupInfo();

  const stepValid = () => {
    if (step === 1) return child.name && child.age && group;
    if (step === 2) return parent.name && parent.phone && parent.email;
    if (step === 3) return program.schedule && program.plan && program.consentGiven;
    return false;
  };

  const handleSubmit = async () => {
    if (!stepValid()) return;
    setLoading(true);
    try {
      await API.post("/book-club/register", { child, parent, program: { ...program, group } });
      setSubmitted(true);
      // Redirect to the appropriate group hub after a moment
      setTimeout(() => {
        window.location.href = `/${group}`;
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .bc-page {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Left panel ─────────────────────────────────────────────────── */
        .bc-left {
          background: linear-gradient(160deg, #2d2640 0%, #1e1a30 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px; color: #fff; text-align: center;
          position: relative; overflow: hidden;
        }
        .bc-left::before {
          content: '';
          position: absolute; width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(195,177,225,0.18), transparent);
          top: -100px; right: -80px; border-radius: 50%;
        }
        .bc-left::after {
          content: '';
          position: absolute; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(251,196,171,0.12), transparent);
          bottom: -60px; left: -40px; border-radius: 50%;
        }

        .bc-logo { font-size: 64px; margin-bottom: 16px; }
        .bc-brand { font-size: 26px; font-weight: 900; margin-bottom: 4px; }
        .bc-tagline { font-size: 13px; color: #bbb; margin-bottom: 48px; }

        .bc-groups { width: 100%; }
        .bc-group-card {
          background: rgba(255,255,255,0.07);
          border-radius: 16px; padding: 18px 20px;
          margin-bottom: 12px; text-align: left;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .bc-group-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
        }
        .bc-age-pill {
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 900;
        }
        .pill-yellow { background: rgba(247,201,72,0.2); color: #f7c948; }
        .pill-blue   { background: rgba(91,184,245,0.2); color: #5bb8f5; }
        .bc-group-name { font-size: 15px; font-weight: 900; color: #fff; }
        .bc-group-focus { font-size: 12px; color: #aaa; font-weight: 600; }
        .bc-focus-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #ccc; font-weight: 600;
          margin-top: 4px;
        }
        .bc-focus-item::before { content: "·"; color: #afa7e7; font-size: 16px; line-height: 1; }

        .bc-schedule-note {
          margin-top: 32px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px; padding: 14px 18px;
          font-size: 13px; font-weight: 700; color: #ddd;
          width: 100%; text-align: left;
        }
        .bc-schedule-note strong { color: #C3B1E1; }

        /* ── Right panel ────────────────────────────────────────────────── */
        .bc-right {
          background: #faf9fe;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 60px; overflow-y: auto;
        }
        .bc-form-card {
          background: #fff; border-radius: 24px; padding: 40px;
          width: 100%; max-width: 460px;
          box-shadow: 0 20px 60px rgba(175,167,231,0.15);
          border: 1.5px solid #f0f0f0;
        }

        /* Step indicator */
        .step-bar {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 32px;
        }
        .step-item {
          display: flex; flex-direction: column; align-items: center; flex: 1;
        }
        .step-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900;
          transition: all 0.3s;
        }
        .step-circle.done    { background: #afa7e7; color: #fff; }
        .step-circle.active  { background: #2d2640; color: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.3); }
        .step-circle.pending { background: #f0eeff; color: #bbb; }
        .step-label { font-size: 10px; font-weight: 800; color: #aaa; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
        .step-label.active { color: #2d2640; }
        .step-line { flex: 1; height: 2px; background: #f0eeff; margin-bottom: 20px; }
        .step-line.done { background: #afa7e7; }

        .bc-form-card h2 { font-size: 24px; font-weight: 900; color: #2d2640; margin: 0 0 4px; }
        .bc-form-card .subtitle { font-size: 13px; color: #aaa; margin: 0 0 24px; }

        /* ── Form elements ──────────────────────────────────────────────── */
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block; font-size: 11px; font-weight: 900; color: #888;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px;
        }
        .form-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e8e4f8; border-radius: 11px;
          font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          transition: all 0.2s; background: #faf9fe;
        }
        .form-input:focus {
          outline: none; border-color: #afa7e7; background: #fff;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
        }
        .form-input::placeholder { color: #ccc; }
        select.form-input { cursor: pointer; }
        textarea.form-input { resize: vertical; min-height: 80px; }

        /* Age-group chip */
        .age-chip {
          display: inline-block; padding: 5px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 800; margin-bottom: 14px;
        }
        .chip-yellow { background: #fffbeb; color: #b8860b; border: 1px solid #f7c94888; }
        .chip-blue   { background: #eff8ff; color: #1a6fa8; border: 1px solid #5bb8f588; }
        .chip-warn   { background: #fff3f3; color: #c0392b; border: 1px solid #e8a0a088; }

        /* Allergy radio */
        .radio-row { display: flex; gap: 16px; margin-bottom: 12px; }
        .radio-opt {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700; color: #555; cursor: pointer;
        }
        .radio-opt input { accent-color: #afa7e7; width: 16px; height: 16px; }

        /* Schedule toggle */
        .schedule-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .schedule-card {
          border: 1.5px solid #e8e4f8; border-radius: 12px; padding: 14px;
          cursor: pointer; text-align: center; transition: all 0.2s; background: #fff;
        }
        .schedule-card:hover { border-color: #afa7e7; background: #f5f2ff; }
        .schedule-card.selected { border-color: #afa7e7; background: #f0eeff; }
        .schedule-day { font-size: 15px; font-weight: 900; color: #2d2640; }
        .schedule-sub { font-size: 11px; font-weight: 700; color: #aaa; margin-top: 2px; }

        /* Plan cards */
        .plan-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
        .plan-card {
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          padding: 12px 8px; cursor: pointer; text-align: center;
          transition: all 0.2s; background: #fff;
        }
        .plan-card:hover   { border-color: #afa7e7; background: #f5f2ff; }
        .plan-card.selected { border-color: #afa7e7; background: #f0eeff; }
        .plan-price { font-size: 14px; font-weight: 900; color: #2d2640; }
        .plan-label { font-size: 10px; font-weight: 700; color: #aaa; margin-top: 3px; }

        /* Consent */
        .consent-box {
          background: #faf9fe; border: 1.5px solid #e8e4f8;
          border-radius: 12px; padding: 14px; margin-bottom: 20px;
        }
        .consent-text { font-size: 13px; font-weight: 600; color: #555; line-height: 1.5; margin-bottom: 10px; }
        .consent-check {
          display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
        }
        .consent-check input { accent-color: #afa7e7; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
        .consent-check span { font-size: 13px; font-weight: 700; color: #2d2640; }

        /* Navigation buttons */
        .nav-btns {
          display: flex; gap: 12px; margin-top: 8px;
        }
        .btn-back {
          flex: 1; padding: 13px;
          background: #f0eeff; color: #8b7fd4;
          border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s;
        }
        .btn-back:hover { background: #e8e3ff; }
        .btn-next {
          flex: 2; padding: 13px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 6px 18px rgba(175,167,231,0.4);
          transition: all 0.2s;
        }
        .btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(175,167,231,0.5); }
        .btn-next:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-switch {
          text-align: center; font-size: 13px; color: #aaa; font-weight: 600; margin-top: 16px;
        }
        .auth-switch a { color: #8b7fd4; font-weight: 800; text-decoration: none; }

        /* Success screen */
        .success-screen {
          text-align: center; padding: 20px 0;
        }
        .success-icon { font-size: 64px; margin-bottom: 16px; }
        .success-title { font-size: 24px; font-weight: 900; color: #2d2640; margin-bottom: 8px; }
        .success-sub   { font-size: 14px; color: #aaa; font-weight: 600; margin-bottom: 24px; line-height: 1.5; }
        .success-chip  {
          display: inline-block; padding: 8px 18px; border-radius: 24px;
          font-size: 14px; font-weight: 800; margin-bottom: 24px;
        }
        .redirecting { font-size: 12px; color: #bbb; font-weight: 600; }

        /* ── Responsive ─────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .bc-page { grid-template-columns: 1fr; }
          .bc-left { padding: 36px 24px; }
          .bc-left::before { width: 160px; height: 160px; top: -50px; right: -40px; }
          .bc-groups, .bc-schedule-note { display: none; }
          .bc-right { padding: 32px 20px; align-items: center; }
          .bc-form-card { padding: 28px 20px; border-radius: 16px; }
          .form-row { grid-template-columns: 1fr; }
          .plan-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 400px) {
          .bc-right { padding: 20px 12px; }
          .bc-form-card { padding: 20px 14px; }
          .schedule-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bc-page">
        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="bc-left">
          <div className="bc-logo">📚</div>
          <div className="bc-brand">The Cuddle Village</div>
          <div className="bc-tagline">Book Club · Ages 4–8</div>

          <div className="bc-groups">
            {/* Group 1 */}
            <div className="bc-group-card">
              <div className="bc-group-header">
                <span className="bc-age-pill pill-yellow">Ages 4–5</span>
                <span className="bc-group-name">Early Learners</span>
              </div>
              <div className="bc-focus-item">Picture books & short stories</div>
              <div className="bc-focus-item">Listening & participation</div>
              <div className="bc-focus-item">Parent-child bonding activities</div>
            </div>

            {/* Group 2 */}
            <div className="bc-group-card">
              <div className="bc-group-header">
                <span className="bc-age-pill pill-blue">Ages 6–8</span>
                <span className="bc-group-name">Growing Readers</span>
              </div>
              <div className="bc-focus-item">Simple reading & storytelling</div>
              <div className="bc-focus-item">Comprehension & discussion</div>
              <div className="bc-focus-item">Building confidence & communication</div>
            </div>
          </div>

          <div className="bc-schedule-note">
            Sessions run on <strong>Saturdays &amp; Sundays</strong>.<br />
            Group placement is automatic based on your child's age.
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        <div className="bc-right">
          <div className="bc-form-card">

            {submitted ? (
              /* ── Success screen ──────────────────────────────────── */
              <div className="success-screen">
                <div className="success-icon">🎉</div>
                <div className="success-title">You're enrolled!</div>
                <div className="success-sub">
                  {child.name} has been registered for the Book Club.<br />
                  You'll receive a confirmation email shortly.
                </div>
                {gi && (
                  <div className={`success-chip age-chip ${gi.cls}`}>{gi.label}</div>
                )}
                <div className="redirecting">Taking you to your group hub…</div>
              </div>
            ) : (
              <>
                {/* ── Step bar ─────────────────────────────────────── */}
                <div className="step-bar">
                  {[
                    { n: 1, label: "Child" },
                    { n: 2, label: "Parent" },
                    { n: 3, label: "Program" },
                  ].map((s, i, arr) => (
                    <React.Fragment key={s.n}>
                      <div className="step-item">
                        <div className={`step-circle ${step > s.n ? "done" : step === s.n ? "active" : "pending"}`}>
                          {step > s.n ? "✓" : s.n}
                        </div>
                        <div className={`step-label ${step === s.n ? "active" : ""}`}>{s.label}</div>
                      </div>
                      {i < arr.length - 1 && <div className={`step-line ${step > s.n ? "done" : ""}`} />}
                    </React.Fragment>
                  ))}
                </div>

                {/* ── Step 1: Child Information ─────────────────────── */}
                {step === 1 && (
                  <>
                    <h2>Child Information</h2>
                    <p className="subtitle">Tell us about the child joining the club</p>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="name" placeholder="e.g. Amara Njeri" className="form-input" value={child.name} onChange={handleChild} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input name="age" type="number" min="4" max="8" placeholder="4–8" className="form-input" value={child.age} onChange={handleChild} />
                      </div>
                    </div>

                    {gi && <div className={`age-chip ${gi.cls}`}>{gi.label}</div>}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input name="dob" type="date" className="form-input" value={child.dob} onChange={handleChild} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">School (optional)</label>
                        <input name="school" placeholder="School name" className="form-input" value={child.school} onChange={handleChild} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Allergies</label>
                      <div className="radio-row">
                        <label className="radio-opt">
                          <input type="radio" name="hasAllergies" value="no" defaultChecked
                            onChange={() => setChild({ ...child, allergies: "" })} />
                          No allergies
                        </label>
                        <label className="radio-opt">
                          <input type="radio" name="hasAllergies" value="yes" />
                          Yes, specify below
                        </label>
                      </div>
                      <input name="allergies" placeholder="e.g. Peanuts, Dairy…" className="form-input" value={child.allergies} onChange={handleChild} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Special Needs / Instructions</label>
                      <textarea name="specialNeeds" placeholder="Any special needs or notes for our staff…" className="form-input" value={child.specialNeeds} onChange={handleChild} />
                    </div>

                    <div className="nav-btns">
                      <button className="btn-next" disabled={!child.name || !child.age || !group} onClick={() => setStep(2)}>
                        Next: Parent Info →
                      </button>
                    </div>
                    {!group && child.age && (
                      <p style={{ fontSize: 12, color: "#c0392b", marginTop: 8, textAlign: "center", fontWeight: 700 }}>
                        Book Club accepts ages 4–8 only.
                      </p>
                    )}
                  </>
                )}

                {/* ── Step 2: Parent / Guardian ─────────────────────── */}
                {step === 2 && (
                  <>
                    <h2>Parent / Guardian</h2>
                    <p className="subtitle">Your contact details & emergency info</p>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="name" placeholder="Jane Kamau" className="form-input" value={parent.name} onChange={handleParent} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input name="phone" placeholder="07XX XXX XXX" className="form-input" value={parent.phone} onChange={handleParent} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input name="email" type="email" placeholder="you@example.com" className="form-input" value={parent.email} onChange={handleParent} />
                    </div>
 
                    <div className="form-group">
                      <label className="form-label">Emergency Contact</label>
                      <input name="emergencyContact" placeholder="Name & phone number" className="form-input" value={parent.emergencyContact} onChange={handleParent} />
                    </div>

                    <div className="nav-btns">
                      <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                      <button className="btn-next" disabled={!parent.name || !parent.phone || !parent.email} onClick={() => setStep(3)}>
                        Next: Program →
                      </button>
                    </div>
                  </>
                )}

                {/* ── Step 3: Program Selection ─────────────────────── */}
                {step === 3 && (
                  <>
                    <h2>Program Selection</h2>
                    <p className="subtitle">Choose a schedule and membership plan</p>

                    {gi && <div className={`age-chip ${gi.cls}`} style={{ marginBottom: 16 }}>{gi.label}</div>}

                    <label className="form-label" style={{ marginBottom: 8 }}>Preferred Schedule</label>
                    <div className="schedule-cards" style={{ marginBottom: 20 }}>
                      {[
                        { value: "saturday", day: "Saturday", sub: "Morning sessions" },
                        { value: "sunday",   day: "Sunday",   sub: "Morning sessions" },
                      ].map((s) => (
                        <div
                          key={s.value}
                          className={`schedule-card ${program.schedule === s.value ? "selected" : ""}`}
                          onClick={() => setProgram({ ...program, schedule: s.value })}
                        >
                          <div className="schedule-day">{s.day}</div>
                          <div className="schedule-sub">{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    <label className="form-label" style={{ marginBottom: 8 }}>Membership Plan</label>
                    <div className="plan-cards">
                      {PLANS.map((p) => (
                        <div
                          key={p.value}
                          className={`plan-card ${program.plan === p.value ? "selected" : ""}`}
                          onClick={() => setProgram({ ...program, plan: p.value })}
                        >
                          <div className="plan-price">{p.price}</div>
                          <div className="plan-label">{p.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Consent */}
                    <div className="consent-box">
                      <div className="consent-text">
                        I agree to allow my child to participate in The Cuddle Village Book Club activities and acknowledge the terms of the selected membership plan.
                      </div>
                      <label className="consent-check">
                        <input type="checkbox" checked={program.consentGiven}
                          onChange={(e) => setProgram({ ...program, consentGiven: e.target.checked })} />
                        <span>I give my consent as parent / guardian</span>
                      </label>
                    </div>

                    <div className="nav-btns">
                      <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                      <button
                        className="btn-next"
                        disabled={!stepValid() || loading}
                        onClick={handleSubmit}
                      >
                        {loading ? "Submitting…" : "Complete Registration →"}
                      </button>
                    </div>
                  </>
                )}

                <div className="auth-switch" style={{ marginTop: 20 }}>
                  Already have an account? <Link to="/login">Login</Link>
                  {" · "}
                  <Link to="/register">Main sign-up</Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default BookClubRegister;