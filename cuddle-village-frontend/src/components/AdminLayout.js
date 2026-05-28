import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { logout } from "../utils/auth";
import API from "../services/api";

function AdminLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const [profileForm, setProfileForm] = useState({ name: storedUser.name || "", phone: storedUser.phone || "" });
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const initials = storedUser.name
    ? storedUser.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "A";

  const navLinks = [
    { to: "/admin/admin-dashboard", label: "Dashboard",   emoji: "📊" },
    { to: "/admin/products",        label: "Products",    emoji: "🛍️" },
    { to: "/admin/products/add",    label: "Add Product", emoji: "➕" },
    { to: "/admin/users",           label: "Users",       emoji: "👥" },
    { to: "/admin/orders",          label: "Orders",      emoji: "📋" },
    { to: "/admin/promo-codes",     label: "Promo Codes", emoji: "🏷️" },
    { to: "/admin/book-club",       label: "Book Club",   emoji: "📚" },
  ];

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

        .admin-layout {
          display: flex;
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
        }

        /* ── Floating sidebar ── */
        .admin-sidebar {
          width: 220px;
          height: 100vh;
          background: #2d2640;
          padding: 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          position: fixed;
          left: 0; top: 0;
          z-index: 100;
          overflow-y: auto;
        }

        .sidebar-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 0 10px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 10px;
        }
        .sidebar-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .sidebar-brand-text { font-size: 15px; font-weight: 900; color: #fff; line-height: 1.2; }
        .sidebar-brand-sub  { font-size: 10px; font-weight: 600; color: #afa7e7; letter-spacing: 0.5px; }

        .nav-label {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 0 10px; margin-bottom: 6px; margin-top: 4px;
        }

        .sidebar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px;
          text-decoration: none; font-size: 14px; font-weight: 700;
          color: rgba(255,255,255,0.55); transition: all 0.2s;
          border: 1px solid transparent;
        }
        .sidebar-link:hover { background: rgba(175,167,231,0.12); color: #fff; }
        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(195,177,225,0.25), rgba(175,167,231,0.2));
          color: #fff; border: 1px solid rgba(175,167,231,0.3);
        }
        .sidebar-link-emoji { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
        .sidebar-active-dot { width: 6px; height: 6px; border-radius: 50%; background: #afa7e7; margin-left: auto; flex-shrink: 0; }

        /* ── Floating footer ── */
        .sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; gap: 8px;
          position: sticky; bottom: 0;
        }

        .sidebar-profile-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: rgba(175,167,231,0.1);
          border-radius: 12px;
          border: 1px solid rgba(175,167,231,0.2);
          cursor: pointer; width: 100%;
          transition: all 0.2s; text-align: left;
        }
        .sidebar-profile-btn:hover { background: rgba(175,167,231,0.2); border-color: rgba(175,167,231,0.4); }

        .sidebar-footer-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; color: #1a1530; flex-shrink: 0;
        }
        .sidebar-footer-name { font-size: 12px; font-weight: 800; color: #fff; }
        .sidebar-footer-role { font-size: 10px; font-weight: 600; color: #afa7e7; }
        .sidebar-footer-edit { font-size: 10px; color: #afa7e7; margin-left: auto; flex-shrink: 0; opacity: 0.7; }

        .logout-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px;
          border: 1px solid rgba(232,100,100,0.3);
          background: rgba(232,100,100,0.08);
          color: #f08080; font-size: 14px; font-weight: 700;
          font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(232,100,100,0.18); color: #fff; }

        /* ── Main content ── */
        .admin-content {
          flex: 1;
          margin-left: 220px;
          padding: 40px;
          background: #faf9fe;
          min-height: 100vh;
          overflow-y: auto;
        }

        /* ── Mobile ── */
        .admin-mobile-topbar {
          display: none; align-items: center; gap: 12px;
          padding: 14px 20px; background: #2d2640;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky; top: 0; z-index: 200;
        }
        .admin-hamburger {
          background: none; border: none; cursor: pointer;
          color: #fff; padding: 4px; display: flex; align-items: center; font-size: 18px;
        }
        .admin-mobile-brand { font-size: 15px; font-weight: 900; color: #fff; }

        .admin-sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 99;
        }
        .admin-sidebar-overlay.open { display: block; }

        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-mobile-topbar { display: flex; }
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.28s ease;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-content { margin-left: 0; padding: 24px 16px; }
        }

        /* ── Profile modal ── */
        .profile-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .profile-modal {
          background: #fff; border-radius: 20px; padding: 32px;
          width: 100%; max-width: 400px;
          box-shadow: 0 24px 60px rgba(45,38,64,0.25);
          animation: pmSlide 0.22s ease;
        }
        @keyframes pmSlide { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .pm-title { font-size: 20px; font-weight: 900; color: #2d2640; margin: 0 0 20px; }
        .pm-field { margin-bottom: 14px; }
        .pm-label { display: block; font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .pm-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #2d2640; background: #faf9fe; box-sizing: border-box; transition: all 0.2s;
        }
        .pm-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
        .pm-input:read-only { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
        .pm-error { color: #e74c3c; font-size: 13px; margin: 8px 0 0; font-weight: 600; }
        .pm-actions { display: flex; gap: 10px; margin-top: 20px; }
        .pm-save {
          flex: 1; padding: 12px; background: linear-gradient(135deg,#7c5cbf,#6040a8);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: opacity 0.2s;
        }
        .pm-save:disabled { opacity: 0.65; cursor: not-allowed; }
        .pm-cancel {
          flex: 1; padding: 12px; background: #f5f3ff; color: #8b7fd4;
          border: 1.5px solid #e8e4f8; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }
        .pm-cancel:hover { background: #ede9f8; }
      `}</style>

      <div className="admin-layout">
        {/* Mobile topbar */}
        <div className="admin-mobile-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <span className="admin-mobile-brand">🧸 Admin Panel</span>
        </div>

        {/* Overlay */}
        <div
          className={`admin-sidebar-overlay${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🧸</div>
            <div>
              <div className="sidebar-brand-text">Cuddle Village</div>
              <div className="sidebar-brand-sub">Admin Panel</div>
            </div>
          </div>

          <div className="nav-label">Menu</div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-link${isActive ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-emoji">{link.emoji}</span>
                {link.label}
                {isActive && <span className="sidebar-active-dot" />}
              </Link>
            );
          })}

          <div className="sidebar-footer">
            <button
              className="sidebar-profile-btn"
              onClick={() => { setProfileOpen(true); setSidebarOpen(false); }}
              title="Edit profile"
            >
              <div className="sidebar-footer-avatar">{initials}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="sidebar-footer-name" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {storedUser.name || "Admin"}
                </div>
                <div className="sidebar-footer-role">{storedUser.role || "Super Admin"}</div>
              </div>
              <span className="sidebar-footer-edit">✏️</span>
            </button>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">{children}</div>
      </div>

      {/* Edit Profile Modal */}
      {profileOpen && (
        <div className="profile-backdrop" onClick={e => { if (e.target === e.currentTarget) setProfileOpen(false); }}>
          <div className="profile-modal" role="dialog" aria-modal="true">
            <div className="pm-title">Edit Profile</div>
            <form onSubmit={handleProfileSave}>
              <div className="pm-field">
                <label className="pm-label">Full Name</label>
                <input
                  className="pm-input"
                  placeholder="Your name"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="pm-field">
                <label className="pm-label">Email</label>
                <input className="pm-input" type="email" value={storedUser.email || ""} readOnly />
              </div>
              <div className="pm-field">
                <label className="pm-label">Phone</label>
                <input
                  className="pm-input"
                  placeholder="07XX XXX XXX"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              {profileError && <p className="pm-error">{profileError}</p>}
              <div className="pm-actions">
                <button type="button" className="pm-cancel" onClick={() => setProfileOpen(false)}>Cancel</button>
                <button type="submit" className="pm-save" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminLayout;
