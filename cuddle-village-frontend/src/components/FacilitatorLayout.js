import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import API from "../services/api";

const NAV = [
  { to: "/facilitator/dashboard",     label: "Dashboard",     emoji: "📊" },
  { to: "/facilitator/children",      label: "Children",      emoji: "👶" },
  { to: "/facilitator/sessions",      label: "Sessions",      emoji: "📅" },
  { to: "/facilitator/books",         label: "Books",         emoji: "📚" },
  { to: "/facilitator/attendance",    label: "Attendance",    emoji: "✅" },
  { to: "/facilitator/announcements", label: "Announcements", emoji: "📢" },
  { to: "/facilitator/profile",       label: "My Profile",    emoji: "👤" },
];

export default function FacilitatorLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const [profileForm, setProfileForm] = useState({ name: storedUser.name || "", phone: storedUser.phone || "" });
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const initials = storedUser.name
    ? storedUser.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "F";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSaving(true);
    try {
      const res = await API.put("/auth/profile", profileForm);
      const updated = res.data;
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, phone: updated.phone }));
      setProfileOpen(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .fl-wrap { display: flex; font-family: 'Nunito', sans-serif; min-height: 100vh; }

        /* ── Floating sidebar ── */
        .fl-sidebar {
          width: 220px; height: 100vh; background: #1e2a1e;
          padding: 24px 14px; display: flex; flex-direction: column;
          gap: 4px; flex-shrink: 0;
          position: fixed; left: 0; top: 0; z-index: 100;
          overflow-y: auto;
        }

        .fl-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 0 8px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 8px;
        }
        .fl-brand-icon {
          width: 36px; height: 36px; background: linear-gradient(135deg,#4caf50,#2e7d32);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .fl-brand-name { font-size: 14px; font-weight: 900; color: #fff; line-height: 1.2; }
        .fl-brand-sub  { font-size: 10px; font-weight: 600; color: #81c784; letter-spacing: 0.5px; }

        .fl-nav-label {
          font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 0 8px; margin: 6px 0 4px;
        }

        .fl-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none; font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.55); transition: all 0.18s;
          border: 1px solid transparent;
        }
        .fl-link:hover { background: rgba(76,175,80,0.12); color: #fff; }
        .fl-link.active {
          background: linear-gradient(135deg, rgba(76,175,80,0.25), rgba(46,125,50,0.2));
          color: #fff; border: 1px solid rgba(76,175,80,0.3);
        }
        .fl-link-emoji { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
        .fl-active-dot { width: 6px; height: 6px; border-radius: 50%; background: #4caf50; margin-left: auto; flex-shrink: 0; }

        /* ── Floating footer ── */
        .fl-footer {
          margin-top: auto; padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; gap: 8px;
          position: sticky; bottom: 0;
        }

        .fl-profile-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 12px;
          background: rgba(76,175,80,0.1); border-radius: 10px;
          border: 1px solid rgba(76,175,80,0.2);
          cursor: pointer; width: 100%; text-align: left; transition: all 0.18s;
        }
        .fl-profile-btn:hover { background: rgba(76,175,80,0.2); border-color: rgba(76,175,80,0.4); }

        .fl-user-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg,#4caf50,#2e7d32);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .fl-user-name { font-size: 12px; font-weight: 800; color: #fff; }
        .fl-user-role { font-size: 10px; font-weight: 600; color: #81c784; }
        .fl-edit-hint { font-size: 10px; color: #81c784; margin-left: auto; flex-shrink: 0; opacity: 0.7; }

        .fl-logout {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          border: 1px solid rgba(232,100,100,0.3);
          background: rgba(232,100,100,0.08); color: #f08080;
          font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .fl-logout:hover { background: rgba(232,100,100,0.18); color: #fff; }

        /* ── Content ── */
        .fl-content {
          flex: 1; margin-left: 220px;
          background: #faf9fe; min-height: 100vh; overflow-y: auto;
        }

        /* ── Mobile ── */
        .fl-topbar {
          display: none; align-items: center; gap: 12px;
          padding: 14px 20px; background: #1e2a1e;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky; top: 0; z-index: 200;
        }
        .fl-hamburger {
          background: none; border: none; cursor: pointer;
          color: #fff; padding: 4px; display: flex; align-items: center; font-size: 18px;
        }
        .fl-topbar-brand { font-size: 15px; font-weight: 900; color: #fff; }

        .fl-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 99;
        }
        .fl-overlay.open { display: block; }

        @media (max-width: 768px) {
          .fl-wrap { flex-direction: column; }
          .fl-topbar { display: flex; }
          .fl-sidebar { transform: translateX(-100%); transition: transform 0.26s ease; }
          .fl-sidebar.open { transform: translateX(0); }
          .fl-content { margin-left: 0; }
        }

        /* ── Profile modal ── */
        .fl-profile-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .fl-profile-modal {
          background: #fff; border-radius: 20px; padding: 32px;
          width: 100%; max-width: 400px;
          box-shadow: 0 24px 60px rgba(20,40,20,0.25);
          animation: flSlide 0.22s ease;
        }
        @keyframes flSlide { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fl-pm-title { font-size: 20px; font-weight: 900; color: #1e2a1e; margin: 0 0 20px; }
        .fl-pm-field { margin-bottom: 14px; }
        .fl-pm-label { display: block; font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .fl-pm-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e0ede0; border-radius: 12px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #1e2a1e; background: #f6fbf6; box-sizing: border-box; transition: all 0.2s;
        }
        .fl-pm-input:focus { outline: none; border-color: #4caf50; background: #fff; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
        .fl-pm-input:read-only { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
        .fl-pm-error { color: #e74c3c; font-size: 13px; margin: 8px 0 0; font-weight: 600; }
        .fl-pm-actions { display: flex; gap: 10px; margin-top: 20px; }
        .fl-pm-save {
          flex: 1; padding: 12px; background: linear-gradient(135deg,#4caf50,#2e7d32);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: opacity 0.2s;
        }
        .fl-pm-save:disabled { opacity: 0.65; cursor: not-allowed; }
        .fl-pm-cancel {
          flex: 1; padding: 12px; background: #f0faf0; color: #2e7d32;
          border: 1.5px solid #c8e6c9; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }
        .fl-pm-cancel:hover { background: #e8f5e9; }
      `}</style>

      <div className="fl-wrap">
        {/* Mobile topbar */}
        <div className="fl-topbar">
          <button className="fl-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <span className="fl-topbar-brand">📚 Book Club Portal</span>
        </div>

        {/* Overlay */}
        <div className={`fl-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />

        {/* Sidebar */}
        <div className={`fl-sidebar${open ? " open" : ""}`}>
          <div className="fl-brand">
            <div className="fl-brand-icon">📚</div>
            <div>
              <div className="fl-brand-name">Book Club</div>
              <div className="fl-brand-sub">Facilitator Portal</div>
            </div>
          </div>

          <div className="fl-nav-label">Navigation</div>

          {NAV.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`fl-link${isActive ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="fl-link-emoji">{link.emoji}</span>
                {link.label}
                {isActive && <span className="fl-active-dot" />}
              </Link>
            );
          })}

          <div className="fl-footer">
            <button
              className="fl-profile-btn"
              onClick={() => { setProfileOpen(true); setOpen(false); }}
              title="Edit profile"
            >
              <div className="fl-user-avatar">{initials}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="fl-user-name" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {storedUser.name || "Facilitator"}
                </div>
                <div className="fl-user-role">Facilitator</div>
              </div>
              <span className="fl-edit-hint">✏️</span>
            </button>
            <button className="fl-logout" onClick={logout}>🚪 Logout</button>
          </div>
        </div>

        {/* Main content */}
        <div className="fl-content">{children}</div>
      </div>

      {/* Edit Profile Modal */}
      {profileOpen && (
        <div className="fl-profile-backdrop" onClick={e => { if (e.target === e.currentTarget) setProfileOpen(false); }}>
          <div className="fl-profile-modal" role="dialog" aria-modal="true">
            <div className="fl-pm-title">Edit Profile</div>
            <form onSubmit={handleProfileSave}>
              <div className="fl-pm-field">
                <label className="fl-pm-label">Full Name</label>
                <input
                  className="fl-pm-input"
                  placeholder="Your name"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="fl-pm-field">
                <label className="fl-pm-label">Email</label>
                <input className="fl-pm-input" type="email" value={storedUser.email || ""} readOnly />
              </div>
              <div className="fl-pm-field">
                <label className="fl-pm-label">Phone</label>
                <input
                  className="fl-pm-input"
                  placeholder="07XX XXX XXX"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              {profileError && <p className="fl-pm-error">{profileError}</p>}
              <div className="fl-pm-actions">
                <button type="button" className="fl-pm-cancel" onClick={() => setProfileOpen(false)}>Cancel</button>
                <button type="submit" className="fl-pm-save" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
