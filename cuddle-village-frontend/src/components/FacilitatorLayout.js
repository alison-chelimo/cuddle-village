import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";

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

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "F";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .fl-wrap { display: flex; font-family: 'Nunito', sans-serif; }

        /* ── Sidebar ── */
        .fl-sidebar {
          width: 220px; height: 100vh; background: #1e2a1e;
          padding: 24px 14px; display: flex; flex-direction: column;
          gap: 4px; flex-shrink: 0; position: sticky; top: 0;
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
        .fl-active-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4caf50; margin-left: auto; flex-shrink: 0;
        }

        .fl-footer {
          margin-top: auto; padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; gap: 8px;
        }
        .fl-user-badge {
          display: flex; align-items: center; gap: 8px; padding: 10px 12px;
          background: rgba(76,175,80,0.1); border-radius: 10px;
          border: 1px solid rgba(76,175,80,0.2);
        }
        .fl-user-avatar {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg,#4caf50,#2e7d32);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .fl-user-name { font-size: 12px; font-weight: 800; color: #fff; }
        .fl-user-role { font-size: 10px; font-weight: 600; color: #81c784; }

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
          flex: 1; background: #faf9fe;
          min-height: 100vh; overflow-y: auto;
        }

        /* ── Mobile topbar ── */
        .fl-topbar {
          display: none; align-items: center; gap: 12px;
          padding: 14px 20px; background: #1e2a1e;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .fl-hamburger {
          background: none; border: none; cursor: pointer;
          color: #fff; padding: 4px; display: flex; align-items: center; font-size: 18px;
        }
        .fl-topbar-brand { font-size: 15px; font-weight: 900; color: #fff; }

        /* ── Overlay ── */
        .fl-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 99;
        }
        .fl-overlay.open { display: block; }

        @media (max-width: 768px) {
          .fl-wrap { flex-direction: column; }
          .fl-topbar { display: flex; }
          .fl-sidebar {
            position: fixed; left: 0; top: 0; height: 100vh;
            z-index: 100; transform: translateX(-100%);
            transition: transform 0.26s ease;
          }
          .fl-sidebar.open { transform: translateX(0); }
          .fl-content { min-height: calc(100vh - 56px); }
        }
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
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`fl-link${active ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="fl-link-emoji">{link.emoji}</span>
                {link.label}
                {active && <span className="fl-active-dot" />}
              </Link>
            );
          })}

          <div className="fl-footer">
            <div className="fl-user-badge">
              <div className="fl-user-avatar">{initials}</div>
              <div>
                <div className="fl-user-name">{user.name || "Facilitator"}</div>
                <div className="fl-user-role">Facilitator</div>
              </div>
            </div>
            <button className="fl-logout" onClick={logout}>🚪 Logout</button>
          </div>
        </div>

        {/* Main content */}
        <div className="fl-content">{children}</div>
      </div>
    </>
  );
}
