import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login"); 
  };

  const navLinks = [
    { to: "/admin/admin-dashboard", label: "Dashboard",  emoji: "📊" },
    { to: "/admin/products",        label: "Products",   emoji: "🛍️" },
    { to: "/admin/products/add",    label: "Add Product",emoji: "➕" },
    { to: "/admin/users",           label: "Users",      emoji: "👥" },
    { to: "/admin/orders",          label: "Orders",     emoji: "📋" },
    { to: "/admin/book-club",       label: "Book Club",  emoji: "📚" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .admin-layout {
          display: flex;
          font-family: 'Nunito', sans-serif;
        }

        .admin-sidebar {
          width: 220px;
          height: 100vh;
          background: #2d2640;
          padding: 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
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
          border: 1px solid transparent;
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
          display: flex;
          flex-direction: column;
          gap: 8px;
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

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid rgba(232, 100, 100, 0.3);
          background: rgba(232, 100, 100, 0.08);
          color: #f08080;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(232, 100, 100, 0.18);
          color: #fff;
        }

        .admin-content {
          flex: 1;
          padding: 40px;
          background: #faf9fe;
          min-height: 100vh;
          overflow-y: auto;
        }

        .admin-mobile-topbar {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: #2d2640;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .admin-hamburger {
          background: none; border: none; cursor: pointer;
          color: #fff; padding: 4px; display: flex; align-items: center;
          font-size: 18px;
        }
        .admin-mobile-brand {
          font-size: 15px; font-weight: 900; color: #fff;
        }

        .admin-sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 99;
        }
        .admin-sidebar-overlay.open { display: block; }

        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-mobile-topbar { display: flex; }
          .admin-sidebar {
            position: fixed; left: 0; top: 0;
            height: 100vh; z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.28s ease;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-content { padding: 24px 16px; }
        }
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
            <div className="sidebar-footer-badge">
              <div className="sidebar-footer-avatar">👤</div>
              <div>
                <div className="sidebar-footer-name">Admin</div>
                <div className="sidebar-footer-role">Super Admin</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">{children}</div>
      </div>
    </>
  );
}

export default AdminLayout;