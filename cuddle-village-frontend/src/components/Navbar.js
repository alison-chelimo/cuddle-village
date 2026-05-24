import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useLoyalty } from "../context/LoyaltyContext";
import { FaShoppingCart, FaSearch, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { isAuthenticated, logout } from "../utils/auth";
import logo from "../assets/logo1.JPG";

const TIER_COLORS = { Bronze: "#b8860b", Silver: "#666", Gold: "#d4a017", Platinum: "#6b5fc7" };
const TIER_BG     = { Bronze: "#fffbeb",  Silver: "#f5f5f5", Gold: "#fff9eb",  Platinum: "#f5f2ff" };

function Navbar() {
  const { cart } = useContext(CartContext);
  const { points, tier } = useLoyalty();
  const location = useLocation();
  const navigate  = useNavigate();
  const [query, setQuery]     = useState("");
  const [menuOpen, setMenu]   = useState(false);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const isActive   = (path) => location.pathname === path;
  const auth       = isAuthenticated();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setMenu(false);
      setQuery("");
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : null;

  const NAV_LINKS = [
    { to: "/products",   label: "Shop"       },
    { to: "/book-club",  label: "Book Club"  },
    { to: "/blog",       label: "Blog"       },
    { to: "/about",      label: "About"      },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Announcement bar ──────────────────────────────────── */
        .nb-announce {
          background: linear-gradient(90deg, #2d2640 0%, #3d3460 50%, #2d2640 100%);
          color: #ccc;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          padding: 8px 24px;
          letter-spacing: 0.3px;
          border-bottom: 1px solid rgba(175,167,231,0.15);
        }
        .nb-announce em { color: #C3B1E1; font-style: normal; font-weight: 800; }
        .nb-announce-sep { margin: 0 10px; opacity: 0.4; }

        /* ── Main navbar ───────────────────────────────────────── */
        .nb {
          background: #fff;
          padding: 0 28px;
          display: flex;
          align-items: center;
          height: 66px;
          box-shadow: 0 1px 0 #f0edff, 0 4px 20px rgba(175,167,231,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Nunito', sans-serif;
          gap: 16px;
        }

        /* ── Brand ─────────────────────────────────────────────── */
        .nb-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
        }
        .nb-brand-logo {
          width: 36px; height: 36px; border-radius: 10px;
          object-fit: contain; border: 1.5px solid #f0edff;
        }
        .nb-brand-name { font-size: 15px; font-weight: 900; color: #2d2640; line-height: 1.1; }
        .nb-brand-sub  { font-size: 9.5px; color: #bbb; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; }

        /* ── Search ────────────────────────────────────────────── */
        .nb-search {
          flex: 1; max-width: 400px;
          display: flex; align-items: center;
          background: #f5f3ff;
          border-radius: 12px;
          border: 1.5px solid #ede9f8;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .nb-search:focus-within {
          border-color: #afa7e7;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
          background: #fff;
        }
        .nb-search input {
          flex: 1; border: none; background: transparent;
          padding: 9px 14px; font-size: 13px;
          font-family: 'Nunito', sans-serif; font-weight: 600; color: #333; outline: none;
        }
        .nb-search input::placeholder { color: #c4bfdc; }
        .nb-search button {
          background: none; border: none; padding: 9px 14px;
          color: #afa7e7; cursor: pointer; font-size: 14px;
          display: flex; align-items: center; transition: color 0.2s;
        }
        .nb-search button:hover { color: #8b7fd4; }

        /* ── Nav links ─────────────────────────────────────────── */
        .nb-links { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }

        .nb-link {
          text-decoration: none; color: #555; font-size: 13.5px; font-weight: 700;
          padding: 6px 11px; border-radius: 8px;
          transition: color 0.18s, background 0.18s;
          position: relative; white-space: nowrap;
        }
        .nb-link:hover { color: #8b7fd4; background: #faf9fe; }
        .nb-link.active { color: #8b7fd4; }
        .nb-link.active::after {
          content: '';
          position: absolute; bottom: -2px; left: 11px; right: 11px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #C3B1E1, #afa7e7);
        }

        .nb-link-shop {
          background: linear-gradient(135deg, #f0edff, #ebe6ff);
          color: #8b7fd4 !important;
          border: 1.5px solid #e8e4f8;
          font-weight: 800;
        }
        .nb-link-shop:hover { background: linear-gradient(135deg, #e8e4f8, #ddd5f8) !important; }
        .nb-link-shop.active::after { display: none; }
        .nb-link-shop.active { opacity: 1; filter: brightness(0.94); }

        /* ── Right-side icons ──────────────────────────────────── */
        .nb-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 4px; }

        .nb-icon-btn {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          background: #f5f3ff; border-radius: 10px;
          color: #8b7fd4; text-decoration: none;
          transition: background 0.18s, transform 0.15s;
          border: none; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }
        .nb-icon-btn:hover { background: #ede9f8; transform: translateY(-1px); }

        .nb-cart-badge {
          position: absolute; top: -5px; right: -5px;
          background: #FBC4AB; color: #fff; border-radius: 50%;
          width: 17px; height: 17px; font-size: 9.5px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }

        .nb-profile-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 10px 6px 7px;
          background: #f5f3ff; border-radius: 10px;
          text-decoration: none; color: #2d2640;
          transition: background 0.18s;
          border: 1.5px solid #ede9f8;
          width: auto;
        }
        .nb-profile-btn:hover { background: #ede9f8; }
        .nb-profile-avatar {
          width: 26px; height: 26px; border-radius: 8px;
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .nb-tier-badge {
          font-size: 10.5px; font-weight: 900;
          padding: 2px 7px; border-radius: 20px;
          white-space: nowrap;
        }

        .nb-divider { width: 1px; height: 22px; background: #f0edff; margin: 0 2px; }

        .nb-btn {
          padding: 8px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; border: none;
          transition: all 0.18s;
          font-family: 'Nunito', sans-serif;
          white-space: nowrap;
        }
        .nb-btn-outline { background: transparent; border: 1.5px solid #e8e4f8; color: #8b7fd4; }
        .nb-btn-outline:hover { background: #f5f3ff; }
        .nb-btn-fill {
          background: linear-gradient(135deg,#C3B1E1,#afa7e7); color: #fff;
          box-shadow: 0 3px 12px rgba(175,167,231,0.35);
        }
        .nb-btn-fill:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(175,167,231,0.45); }

        /* ── Hamburger ─────────────────────────────────────────── */
        .nb-hamburger {
          display: none;
          background: #f5f3ff; border: 1.5px solid #ede9f8;
          border-radius: 10px; width: 40px; height: 40px;
          align-items: center; justify-content: center;
          color: #8b7fd4; cursor: pointer; flex-shrink: 0;
        }

        /* ── Mobile drawer ─────────────────────────────────────── */
        .nb-drawer {
          position: fixed; top: 0; right: -320px;
          width: 300px; max-width: 85vw; height: 100vh;
          background: #fff; z-index: 200;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(45,38,64,0.15);
          transition: right 0.28s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Nunito', sans-serif;
          overflow-y: auto;
        }
        .nb-drawer.open { right: 0; }

        .nb-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 199;
          opacity: 0; pointer-events: none; transition: opacity 0.25s;
        }
        .nb-drawer-overlay.open { opacity: 1; pointer-events: all; }

        .nb-drawer-head {
          padding: 20px 20px 16px;
          border-bottom: 1.5px solid #f0edff;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nb-drawer-close {
          background: #f5f3ff; border: none; border-radius: 8px;
          width: 34px; height: 34px; display: flex; align-items: center;
          justify-content: center; color: #8b7fd4; cursor: pointer;
        }

        /* Profile strip in drawer (when logged in) */
        .nb-drawer-profile {
          margin: 14px 16px;
          background: linear-gradient(135deg,#f0edff,#faf9fe);
          border: 1.5px solid #e8e4f8; border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; color: inherit;
        }
        .nb-drawer-profile-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .nb-drawer-profile-name { font-size: 14px; font-weight: 900; color: #2d2640; }
        .nb-drawer-profile-tier { font-size: 11px; font-weight: 800; margin-top: 2px; }

        .nb-drawer-section { padding: 8px 16px 4px; font-size: 10px; font-weight: 900; color: #ccc; text-transform: uppercase; letter-spacing: 1px; }

        .nb-drawer-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 20px; text-decoration: none;
          font-size: 14px; font-weight: 700; color: #444;
          border-radius: 0; transition: background 0.15s, color 0.15s;
          margin: 1px 8px; border-radius: 10px;
        }
        .nb-drawer-link:hover, .nb-drawer-link.active { background: #f0edff; color: #8b7fd4; }
        .nb-drawer-link-emoji { font-size: 16px; width: 22px; text-align: center; }

        .nb-drawer-search {
          margin: 4px 16px 8px;
          display: flex; align-items: center;
          background: #f5f3ff; border-radius: 12px;
          border: 1.5px solid #ede9f8; overflow: hidden;
        }
        .nb-drawer-search input {
          flex: 1; border: none; background: transparent;
          padding: 10px 14px; font-size: 13px;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #333; outline: none;
        }
        .nb-drawer-search button {
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          border: none; padding: 10px 14px; color: #fff; cursor: pointer;
          font-size: 13px; display: flex; align-items: center;
        }

        .nb-drawer-divider { height: 1px; background: #f0edff; margin: 8px 16px; }

        .nb-drawer-footer { margin-top: auto; padding: 16px; border-top: 1.5px solid #f0edff; display: flex; flex-direction: column; gap: 8px; }
        .nb-drawer-btn {
          padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 800;
          cursor: pointer; border: none; font-family: 'Nunito', sans-serif; text-align: center; text-decoration: none; display: block;
        }
        .nb-drawer-btn-outline { background: transparent; border: 1.5px solid #e8e4f8; color: #8b7fd4; }
        .nb-drawer-btn-fill    { background: linear-gradient(135deg,#C3B1E1,#afa7e7); color: #fff; }
        .nb-drawer-btn-logout  { background: #fff3f3; color: #c0392b; border: 1.5px solid #ffe0e0; }

        /* ── Breakpoints ───────────────────────────────────────── */
        @media (max-width: 900px) {
          .nb-links .nb-link:not(.nb-link-shop):not([href="/book-club"]) { display: none; }
        }
        @media (max-width: 768px) {
          .nb { padding: 0 14px; gap: 10px; }
          .nb-announce { font-size: 11px; padding: 7px 14px; }
          .nb-search  { display: none; }
          .nb-links   { display: none; }
          .nb-profile-btn { display: none; }
          .nb-divider { display: none; }
          .nb-btn     { display: none; }
          .nb-hamburger { display: flex; }
          .nb-brand-sub { display: none; }
        }
        @media (max-width: 400px) {
          .nb-announce { font-size: 10px; padding: 6px 10px; }
        }
      `}</style>

      {/* Announcement bar */}
      <div className="nb-announce">
        🚚 Free delivery on orders over <em>KES 2,000</em>
        <span className="nb-announce-sep">·</span>
        Use <em>CUDDLE10</em> for 10% off your first order
        <span className="nb-announce-sep">·</span>
        📚 Book Club now enrolling
      </div>

      {/* Main navbar */}
      <nav className="nb">
        {/* Brand */}
        <Link to="/" className="nb-brand">
          <img src={logo} alt="The Cuddle Village" className="nb-brand-logo" />
          <div>
            <div className="nb-brand-name">The Cuddle Village</div>
            <div className="nb-brand-sub">Baby · Books · Wellness</div>
          </div>
        </Link>

        {/* Search */}
        <form className="nb-search" onSubmit={handleSearch}>
          <input placeholder="Search products…" value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit"><FaSearch size={13} /></button>
        </form>

        {/* Nav links */}
        <div className="nb-links">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nb-link${l.to === "/products" ? " nb-link-shop" : ""}${isActive(l.to) ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {auth && (
            <Link to="/orders" className={`nb-link${isActive("/orders") ? " active" : ""}`}>Orders</Link>
          )}
        </div>

        {/* Right side */}
        <div className="nb-right">
          {auth ? (
            <>
              <Link
                to="/profile"
                className="nb-icon-btn nb-profile-btn"
                title="My Profile"
                style={{ width: "auto" }}
              >
                <div className="nb-profile-avatar">
                  {initials ? initials : <FaUserCircle size={14} />}
                </div>
                <span
                  className="nb-tier-badge"
                  style={{ background: TIER_BG[tier] || "#f5f3ff", color: TIER_COLORS[tier] || "#8b7fd4" }}
                >
                  ★ {points} · {tier}
                </span>
              </Link>
              <div className="nb-divider" />
            </>
          ) : null}

          <Link to="/cart" className="nb-icon-btn" title="Cart">
            <FaShoppingCart size={16} />
            {totalItems > 0 && <span className="nb-cart-badge">{totalItems}</span>}
          </Link>

          {auth ? (
            <button className="nb-btn nb-btn-outline" onClick={logout}>Logout</button>
          ) : (
            <>
              <Link to="/login"><button className="nb-btn nb-btn-outline">Login</button></Link>
              <Link to="/register"><button className="nb-btn nb-btn-fill">Sign Up</button></Link>
            </>
          )}

          <button className="nb-hamburger" onClick={() => setMenu(true)} aria-label="Open menu">
            <FaBars size={17} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div className={`nb-drawer-overlay${menuOpen ? " open" : ""}`} onClick={() => setMenu(false)} />

      {/* Mobile drawer (slides in from right) */}
      <div className={`nb-drawer${menuOpen ? " open" : ""}`}>
        <div className="nb-drawer-head">
          <Link to="/" className="nb-brand" onClick={() => setMenu(false)}>
            <img src={logo} alt="The Cuddle Village" className="nb-brand-logo" />
            <div className="nb-brand-name" style={{ fontSize: 14 }}>The Cuddle Village</div>
          </Link>
          <button className="nb-drawer-close" onClick={() => setMenu(false)} aria-label="Close menu">
            <FaTimes size={15} />
          </button>
        </div>

        {/* Profile strip (when logged in) */}
        {auth && (
          <Link to="/profile" className="nb-drawer-profile" onClick={() => setMenu(false)}>
            <div className="nb-drawer-profile-avatar">
              {initials || <FaUserCircle size={18} />}
            </div>
            <div>
              <div className="nb-drawer-profile-name">{user.name || "My Profile"}</div>
              <div className="nb-drawer-profile-tier" style={{ color: TIER_COLORS[tier] || "#8b7fd4" }}>
                ★ {points} points · {tier}
              </div>
            </div>
          </Link>
        )}

        {/* Search */}
        <form className="nb-drawer-search" onSubmit={handleSearch}>
          <input placeholder="Search products…" value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit"><FaSearch size={12} /></button>
        </form>

        <div className="nb-drawer-section">Menu</div>
        {[
          { to: "/",          label: "Home",      emoji: "🏠" },
          { to: "/products",  label: "Shop",      emoji: "🛍️" },
          { to: "/book-club", label: "Book Club", emoji: "📚" },
          { to: "/blog",      label: "Blog",      emoji: "✍️" },
          { to: "/about",     label: "About Us",  emoji: "💜" },
          { to: "/faq",       label: "FAQ",       emoji: "❓" },
          { to: "/contact-us",label: "Contact",   emoji: "💬" },
        ].map(l => (
          <Link key={l.to} to={l.to} className={`nb-drawer-link${isActive(l.to) ? " active" : ""}`} onClick={() => setMenu(false)}>
            <span className="nb-drawer-link-emoji">{l.emoji}</span>
            {l.label}
          </Link>
        ))}

        {auth && (
          <>
            <div className="nb-drawer-divider" />
            <div className="nb-drawer-section">Account</div>
            <Link to="/orders" className={`nb-drawer-link${isActive("/orders") ? " active" : ""}`} onClick={() => setMenu(false)}>
              <span className="nb-drawer-link-emoji">📦</span>My Orders
            </Link>
            <Link to="/cart" className={`nb-drawer-link${isActive("/cart") ? " active" : ""}`} onClick={() => setMenu(false)}>
              <span className="nb-drawer-link-emoji">🛒</span>
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </>
        )}

        <div className="nb-drawer-footer">
          {auth ? (
            <button className="nb-drawer-btn nb-drawer-btn-logout" onClick={() => { logout(); setMenu(false); }}>
              🚪 Logout
            </button>
          ) : (
            <>
              <Link to="/login"    className="nb-drawer-btn nb-drawer-btn-outline" onClick={() => setMenu(false)}>Login</Link>
              <Link to="/register" className="nb-drawer-btn nb-drawer-btn-fill"    onClick={() => setMenu(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
