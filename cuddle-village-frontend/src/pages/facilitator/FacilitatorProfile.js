import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";
import useToast from "../../hooks/useToast";
import Toast from "../../components/Toast";

export default function FacilitatorProfile() {
  const { toasts, toast, dismissToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ name: "", phone: "" });

  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [showCurr, setShowCurr] = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    API.get("/auth/profile")
      .then(r => {
        setProfile(r.data);
        setForm({ name: r.data.name || "", phone: r.data.phone || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      setProfile(prev => ({ ...prev, ...form }));
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: form.name, phone: form.phone }));
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
    setSaving(false);
  };

  const handlePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) return toast.error("New passwords do not match.");
    setPwSaving(true);
    try {
      await API.put("/auth/profile/password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
      toast.success("Password changed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
    setPwSaving(false);
  };

  if (loading) return <FacilitatorLayout><div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "Nunito,sans-serif", fontWeight: 700 }}>Loading…</div></FacilitatorLayout>;

  const initials = profile?.name?.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "F";

  return (
    <FacilitatorLayout>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .fp * { font-family:'Nunito',sans-serif; }
        .fp { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .fp-inner { max-width:520px; }
        .fp-hero { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
        .fp-avatar { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#4caf50,#2e7d32); display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:#fff; letter-spacing:1px; }
        .fp-hero-name { font-size:22px; font-weight:900; color:#2d2640; margin:0 0 3px; }
        .fp-hero-role { font-size:13px; color:#4caf50; font-weight:700; }
        .fp-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; padding:24px; margin-bottom:20px; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .fp-card-title { font-size:14px; font-weight:900; color:#2d2640; margin:0 0 18px; padding-bottom:10px; border-bottom:1.5px solid #f0eeff; }
        .fp-group { margin-bottom:14px; }
        .fp-label { display:block; font-size:10px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:5px; }
        .fp-input {
          width:100%; padding:11px 14px; border:1.5px solid #e8e4f8; border-radius:12px;
          font-size:14px; color:#2d2640; font-family:'Nunito',sans-serif; font-weight:600;
          background:#faf9fe; box-sizing:border-box; transition:all 0.2s;
        }
        .fp-input:focus { outline:none; border-color:#4caf50; background:#fff; box-shadow:0 0 0 3px rgba(76,175,80,0.1); }
        .fp-input:disabled { opacity:0.6; cursor:not-allowed; }
        .fp-input::placeholder { color:#ccc; }
        .fp-pw-wrap { position:relative; }
        .fp-pw-wrap .fp-input { padding-right:44px; }
        .fp-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#bbb; padding:0; display:flex; align-items:center; }
        .fp-eye:hover { color:#4caf50; }
        .fp-save { width:100%; padding:12px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; margin-top:4px; }
        .fp-save:disabled { opacity:0.65; cursor:not-allowed; }
        @media(max-width:600px) { .fp { padding:20px 14px; } }
      `}</style>

      <div className="fp">
        <div className="fp-inner">
          <div className="fp-hero">
            <div className="fp-avatar">{initials}</div>
            <div>
              <div className="fp-hero-name">{profile?.name}</div>
              <div className="fp-hero-role">📚 Facilitator</div>
            </div>
          </div>

          {/* Personal details */}
          <div className="fp-card">
            <div className="fp-card-title">Personal Details</div>
            <form onSubmit={handleSave}>
              <div className="fp-group">
                <label className="fp-label">Full Name</label>
                <input className="fp-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
              </div>
              <div className="fp-group">
                <label className="fp-label">Email Address</label>
                <input className="fp-input" value={profile?.email || ""} disabled title="Email cannot be changed" />
                <p style={{ fontSize: 11, color: "#bbb", fontWeight: 600, margin: "4px 0 0" }}>Email is used for login and cannot be changed.</p>
              </div>
              <div className="fp-group">
                <label className="fp-label">Phone</label>
                <input className="fp-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" />
              </div>
              <button type="submit" className="fp-save" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </form>
          </div>

          {/* Change password */}
          <div className="fp-card">
            <div className="fp-card-title">Change Password</div>
            <form onSubmit={handlePw}>
              {[
                { label: "Current Password", key: "currentPassword", show: showCurr, toggle: setShowCurr },
                { label: "New Password",     key: "newPassword",     show: showNew,  toggle: setShowNew  },
                { label: "Confirm New",      key: "confirmNew",      show: showConf, toggle: setShowConf },
              ].map(f => (
                <div className="fp-group" key={f.key}>
                  <label className="fp-label">{f.label}</label>
                  <div className="fp-pw-wrap">
                    <input
                      className="fp-input"
                      type={f.show ? "text" : "password"}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="fp-eye" onClick={() => f.toggle(v => !v)} tabIndex={-1}>
                      {f.show ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              {pwForm.confirmNew && pwForm.newPassword !== pwForm.confirmNew && (
                <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 700, margin: "-8px 0 12px" }}>Passwords do not match</p>
              )}
              <button type="submit" className="fp-save" disabled={pwSaving}>{pwSaving ? "Updating…" : "Update Password"}</button>
            </form>
          </div>
        </div>
      </div>
    </FacilitatorLayout>
  );
}
