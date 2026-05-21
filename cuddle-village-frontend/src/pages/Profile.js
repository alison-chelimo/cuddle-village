import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";
import { useLoyalty } from "../context/LoyaltyContext";

const TIER_CONFIG = {
  Bronze:   { color: "#b8860b", bg: "#fffbeb", next: 1000  },
  Silver:   { color: "#555",    bg: "#f5f5f5", next: 5000  },
  Gold:     { color: "#d4a017", bg: "#fff9eb", next: 15000 },
  Platinum: { color: "#6b5fc7", bg: "#f5f2ff", next: null  },
};

export default function Profile() {
  const navigate = useNavigate();
  const { toasts, toast } = useToast();
  const { points, lifetimePoints, tier, nextTier } = useLoyalty();
  const [transactions, setTransactions] = useState([]);

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ name: "", phone: "" });

  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);

  const pwRules = [
    { label: "At least 8 characters",  met: pwForm.newPassword.length >= 8 },
    { label: "One uppercase letter",   met: /[A-Z]/.test(pwForm.newPassword) },
    { label: "One number",             met: /[0-9]/.test(pwForm.newPassword) },
    { label: "One special character",  met: /[!@#$%^&*(),.?":{}|<>\-_]/.test(pwForm.newPassword) },
  ];
  const pwValid = pwRules.every(r => r.met);

  useEffect(() => {
    Promise.all([
      API.get("/auth/profile"),
      API.get("/loyalty/transactions"),
    ])
      .then(([profileRes, txnRes]) => {
        setProfile(profileRes.data);
        setForm({ name: profileRes.data.name || "", phone: profileRes.data.phone || "" });
        setTransactions(txnRes.data || []);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      setProfile(prev => ({ ...prev, ...form }));
      // Keep localStorage user in sync
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: form.name, phone: form.phone }));
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwValid) return toast.error("New password does not meet all requirements.");
    if (pwForm.newPassword !== pwForm.confirmNew) return toast.error("New passwords do not match.");

    setPwSaving(true);
    try {
      await API.put("/auth/profile/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
      toast.success("Password changed successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div style={{ fontFamily: "Nunito, sans-serif", padding: 60, textAlign: "center", color: "#aaa" }}>
      Loading profile…
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .profile-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          padding: 40px 24px;
        }
        .profile-inner {
          max-width: 580px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .profile-header { margin-bottom: 4px; }
        .profile-header h1 { font-size: 28px; font-weight: 900; color: #2d2640; margin: 0 0 4px; }
        .profile-header p  { font-size: 14px; color: #aaa; margin: 0; }

        .profile-avatar {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(175,167,231,0.3);
        }
        .profile-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(175,167,231,0.1);
          border: 1.5px solid #f0eeff;
        }
        .card-title {
          font-size: 16px; font-weight: 900; color: #2d2640;
          margin: 0 0 20px;
          padding-bottom: 12px;
          border-bottom: 1.5px solid #f0eeff;
        }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 11px; font-weight: 800; color: #888;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px;
        }
        .form-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          background: #faf9fe; box-sizing: border-box; transition: all 0.2s;
        }
        .form-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
        .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
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

        .save-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s;
          margin-top: 4px;
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(175,167,231,0.4); }
        .save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .badge {
          padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 800;
        }
        .badge-role    { background: #f0eeff; color: #8b7fd4; }
        .badge-verified { background: #f0fdf4; color: #166534; }

        .pw-rules { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 4px; }
        .pw-rule  { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; }
        .pw-rule.met   { color: #16a34a; }
        .pw-rule.unmet { color: #bbb; }

        .loyalty-hero { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .loyalty-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .tier-badge   { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 900; margin-left: 8px; }
        .progress-bar-wrap { background: #f0eeff; border-radius: 20px; height: 8px; overflow: hidden; margin: 8px 0 4px; }
        .progress-bar-fill { height: 100%; border-radius: 20px; transition: width 0.6s ease; }
        .txn-row  { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f5f3ff; font-size: 13px; }
        .txn-row:last-child { border-bottom: none; }
        .txn-earn   { color: #16a34a; font-weight: 900; }
        .txn-redeem { color: #c0392b; font-weight: 900; }
      `}</style>

      <div className="profile-page">
        <div className="profile-inner">

          <div className="profile-header">
            <div className="profile-avatar">👤</div>
            <h1>My Profile</h1>
            <p>{profile?.email}</p>
          </div>

          {/* Badges */}
          <div className="badge-row">
            <span className="badge badge-role">{profile?.role === "admin" ? "Admin" : "Customer"}</span>
            {profile?.isVerified && <span className="badge badge-verified">✅ Verified</span>}
            {profile?.bookClub?.group && (
              <span className="badge" style={{ background: "#fff4f0", color: "#e8956d" }}>
                📚 Book Club · {profile.bookClub.group}
              </span>
            )}
          </div>

          {/* Loyalty card */}
          <div className="profile-card">
            <div className="card-title">Loyalty & Rewards</div>
            {(() => {
              const cfg      = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
              const progress = nextTier ? Math.min(100, Math.round((lifetimePoints / nextTier) * 100)) : 100;
              return (
                <>
                  <div className="loyalty-hero">
                    <div className="loyalty-icon" style={{ background: cfg.bg }}>
                      {tier === "Bronze" ? "🥉" : tier === "Silver" ? "🥈" : tier === "Gold" ? "🥇" : "💎"}
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#2d2640" }}>
                        {points.toLocaleString()} <span style={{ fontSize: 14, color: "#aaa", fontWeight: 600 }}>points</span>
                        <span className="tier-badge" style={{ background: cfg.bg, color: cfg.color }}>{tier}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>
                        {nextTier
                          ? `${(nextTier - lifetimePoints).toLocaleString()} pts to next tier`
                          : "You've reached the top tier 🎉"}
                      </div>
                    </div>
                  </div>
                  {nextTier && (
                    <>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: cfg.color }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#bbb", fontWeight: 700 }}>
                        <span>{lifetimePoints.toLocaleString()} pts</span>
                        <span>{nextTier.toLocaleString()} pts</span>
                      </div>
                    </>
                  )}
                  <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginTop: 12, padding: "10px 14px", background: "#faf9fe", borderRadius: 10, border: "1px solid #f0eeff" }}>
                    💡 Earn <strong>1 point</strong> per KES 10 spent. Redeem <strong>100 points</strong> for KES 50 off at checkout.
                  </div>
                  {transactions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Recent Activity</div>
                      {transactions.slice(0, 5).map(t => (
                        <div className="txn-row" key={t._id}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#2d2640" }}>{t.reason || (t.type === "earn" ? "Points earned" : "Points redeemed")}</div>
                            <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                          <span className={t.type === "earn" ? "txn-earn" : "txn-redeem"}>
                            {t.type === "earn" ? "+" : ""}{t.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Edit profile */}
          <div className="profile-card">
            <div className="card-title">Personal Details</div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" value={profile?.email || ""} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" />
              </div>
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="profile-card">
            <div className="card-title">Change Password</div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showCurrent ? "text" : "password"} value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Your current password" required />
                  <button type="button" className="eye-btn" onClick={() => setShowCurrent(p => !p)} tabIndex={-1}>
                    {showCurrent ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showNew ? "text" : "password"} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Choose a strong password" required />
                  <button type="button" className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                    {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {pwForm.newPassword && (
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
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showConfirm ? "text" : "password"} value={pwForm.confirmNew} onChange={e => setPwForm(f => ({ ...f, confirmNew: e.target.value }))} placeholder="Repeat new password" required />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {pwForm.confirmNew && pwForm.newPassword !== pwForm.confirmNew && (
                  <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 700, marginTop: 6 }}>Passwords do not match</p>
                )}
              </div>
              <button className="save-btn" type="submit" disabled={pwSaving}>
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
