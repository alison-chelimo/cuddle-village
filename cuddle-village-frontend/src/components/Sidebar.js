import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const navLinks = [
    { to: "/admin", label: "Dashboard", emoji: "📊" },
    { to: "/admin/products", label: "Products", emoji: "🛍️" },
    { to: "/admin/add-product", label: "Add Product", emoji: "➕" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .sidebar {
          width: 220px;
          height: 100vh;
          background: #2d2640;
          padding: 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          font-family: 'Nunito', sans-serif;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 10px;
        }

        .sidebar-brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .sidebar-brand-text {
          font-size: 15px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
        }

        .sidebar-brand-sub {
          font-size: 10px;
          font-weight: 600;
          color: #afa7e7;
          letter-spacing: 0.5px;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 0 10px;
          margin-bottom: 6px;
          margin-top: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          transition: all 0.2s;
        }

        .sidebar-link:hover {
          background: rgba(175,167,231,0.12);
          color: #fff;
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(195,177,225,0.25), rgba(175,167,231,0.2));
          color: #fff;
          border: 1px solid rgba(175,167,231,0.3);
        }

        .sidebar-link-emoji {
          font-size: 16px;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #afa7e7;
          margin-left: auto;
          flex-shrink: 0;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-footer-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(175,167,231,0.1);
          border-radius: 12px;
          border: 1px solid rgba(175,167,231,0.2);
        }

        .sidebar-footer-avatar {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .sidebar-footer-name {
          font-size: 12px;
          font-weight: 800;
          color: #fff;
        }

        .sidebar-footer-role {
          font-size: 10px;
          font-weight: 600;
          color: #afa7e7;
        }
      `}</style>

      <div className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🧸</div>
          <div>
            <div className="sidebar-brand-text">Cuddle Village</div>
            <div className="sidebar-brand-sub">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <div className="nav-label">Menu</div>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-link-emoji">{link.emoji}</span>
              {link.label}
              {isActive && <span className="sidebar-active-dot" />}
            </Link>
          );
        })}

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">
            <div className="sidebar-footer-avatar">👤</div>
            <div>
              <div className="sidebar-footer-name">Admin</div>
              <div className="sidebar-footer-role">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </>
  ); 
}

export default Sidebar;