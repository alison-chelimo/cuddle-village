import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { isAuthenticated, logout } from "../utils/auth";
import logo from "../assets/logo1.JPG";

function Navbar() {
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .top-bar {
          background: #2d2640;
          color: #ccc;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          padding: 8px 32px;
          letter-spacing: 0.3px;
        }
        .top-bar span { color: #C3B1E1; font-weight: 800; }

        .navbar {
          background: #fff;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 68px;
          box-shadow: 0 2px 20px rgba(175,167,231,0.15);
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Nunito', sans-serif;
          gap: 20px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar-brand-dot {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .navbar-brand-text { font-size: 16px; font-weight: 800; color: #333; line-height: 1.1; }
        .navbar-brand-sub { font-size: 10px; color: #aaa; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; }

        .navbar-logo {
          width: 36px; height: 36px;
          border-radius: 10px;
          object-fit: contain;
        }

        .navbar-search {
          flex: 1; max-width: 420px;
          display: flex; align-items: center;
          background: #f5f3ff;
          border-radius: 12px;
          border: 1.5px solid #e8e4f8;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .navbar-search:focus-within {
          border-color: #afa7e7;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
          background: #fff;
        }
        .navbar-search input {
          flex: 1; border: none; background: transparent;
          padding: 10px 14px; font-size: 13px;
          font-family: 'Nunito', sans-serif; font-weight: 600; color: #333; outline: none;
        }
        .navbar-search input::placeholder { color: #bbb; }
        .navbar-search button {
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border: none; padding: 10px 16px; color: #fff; cursor: pointer;
          font-size: 13px; display: flex; align-items: center; gap: 6px;
          font-family: 'Nunito', sans-serif; font-weight: 700; transition: opacity 0.2s;
        }
        .navbar-search button:hover { opacity: 0.9; }

        .navbar-links { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .nav-link {
          text-decoration: none; color: #555; font-size: 14px; font-weight: 600;
          padding: 8px 13px; border-radius: 10px; transition: all 0.2s; white-space: nowrap;
        }
        .nav-link:hover { background: #f5f3ff; color: #afa7e7; }
        .nav-link.active { background: #f0edff; color: #8b7fd4; }

        .nav-cart {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 42px; height: 42px; background: #f5f3ff; border-radius: 12px;
          color: #8b7fd4; text-decoration: none; transition: all 0.2s;
        }
        .nav-cart:hover { background: #ede9ff; }
        .cart-badge {
          position: absolute; top: -6px; right: -6px;
          background: #FBC4AB; color: #fff; border-radius: 50%;
          width: 18px; height: 18px; font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; border: 2px solid #fff;
        }

        .nav-btn { padding: 9px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Nunito', sans-serif; white-space: nowrap; }
        .nav-btn-outline { background: transparent; border: 2px solid #e8e4f8; color: #8b7fd4; }
        .nav-btn-outline:hover { background: #f5f3ff; }
        .nav-btn-fill { background: linear-gradient(135deg, #C3B1E1, #afa7e7); color: #fff; box-shadow: 0 4px 14px rgba(175,167,231,0.4); }
        .nav-btn-fill:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(175,167,231,0.5); }
        .nav-divider { width: 1px; height: 24px; background: #eee; margin: 0 4px; }

        /* ── Hamburger button ── */
        .nav-hamburger {
          display: none;
          background: #f5f3ff;
          border: none;
          border-radius: 10px;
          width: 42px; height: 42px;
          align-items: center; justify-content: center;
          color: #8b7fd4; cursor: pointer; flex-shrink: 0;
        }

        /* ── Mobile drawer ── */
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: #fff;
          border-top: 1.5px solid #f0edff;
          padding: 16px 20px 20px;
          gap: 8px;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 20px rgba(175,167,231,0.12);
        }
        .mobile-menu.open { display: flex; }

        .mobile-search {
          display: flex; align-items: center;
          background: #f5f3ff;
          border-radius: 12px;
          border: 1.5px solid #e8e4f8;
          overflow: hidden;
          margin-bottom: 4px;
        }
        .mobile-search input {
          flex: 1; border: none; background: transparent;
          padding: 10px 14px; font-size: 13px;
          font-family: 'Nunito', sans-serif; font-weight: 600; color: #333; outline: none;
        }
        .mobile-search button {
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border: none; padding: 10px 14px; color: #fff; cursor: pointer;
          font-size: 13px; display: flex; align-items: center;
        }

        .mobile-nav-link {
          text-decoration: none; color: #555; font-size: 15px; font-weight: 600;
          padding: 10px 12px; border-radius: 10px; transition: all 0.2s;
        }
        .mobile-nav-link:hover, .mobile-nav-link.active { background: #f0edff; color: #8b7fd4; }

        .mobile-divider { height: 1px; background: #f0edff; margin: 4px 0; }

        .mobile-btn {
          padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700;
          cursor: pointer; border: none; font-family: 'Nunito', sans-serif; text-align: center; text-decoration: none;
        }
        .mobile-btn-outline { background: transparent; border: 2px solid #e8e4f8; color: #8b7fd4; }
        .mobile-btn-fill { background: linear-gradient(135deg, #C3B1E1, #afa7e7); color: #fff; }

        /* ── Breakpoints ── */
        @media (max-width: 768px) {
          .top-bar { font-size: 11px; padding: 7px 16px; }
          .navbar { padding: 0 16px; gap: 12px; }
          .navbar-search { display: none; }
          .navbar-links { display: none; }
          .nav-hamburger { display: flex; }
          .navbar-brand-sub { display: none; }
        }

        @media (max-width: 480px) {
          .top-bar { 
            font-size: 10px; 
            padding: 6px 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>

      <div className="top-bar">
        🚚 Free delivery on orders over <span>KES 2,000</span> &nbsp;·&nbsp; Use code <span>CUDDLE10</span> for 10% off your first order!
      </div>

      {/* ── Desktop navbar ── */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="The Cuddle Village" className="navbar-logo" />
          <div>
            <div className="navbar-brand-text">The Cuddle Village</div>
            <div className="navbar-brand-sub">Baby · Books · Wellness</div>
          </div>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            placeholder="Search for products"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit"><FaSearch size={12} /></button>
        </form>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
          <Link to="/blog" className={`nav-link ${isActive("/blog") ? "active" : ""}`}>Blog</Link>
          <Link to="/faq" className={`nav-link ${isActive("/faq") ? "active" : ""}`}>FAQ</Link>
          <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>
          <Link to="/contact-us" className={`nav-link ${isActive("/contact-us") ? "active" : ""}`}>Contact</Link>
          <Link to="/products" className={`nav-link ${isActive("/products") ? "active" : ""}`}>Products</Link>
          {isAuthenticated() && (
            <Link to="/orders" className={`nav-link ${isActive("/orders") ? "active" : ""}`}>Orders</Link>
          )}
          {isAuthenticated() && (
            <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>Profile</Link>
          )}
          <div className="nav-divider" />
          <Link to="/cart" className="nav-cart">
            <FaShoppingCart size={16} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          {isAuthenticated() ? (
            <button className="nav-btn nav-btn-outline" onClick={logout}>Logout</button>
          ) : (
            <>
              <Link to="/login"><button className="nav-btn nav-btn-outline">Login</button></Link>
              <Link to="/register"><button className="nav-btn nav-btn-fill">Sign Up</button></Link>
            </>
          )}
        </div>

        {/* Cart icon always visible on mobile + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="mobile-only-icons">
          <Link to="/cart" className="nav-cart" style={{ display: "none" }} id="mobile-cart">
            <FaShoppingCart size={16} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit"><FaSearch size={12} /></button>
        </form>
        <Link to="/" className={`mobile-nav-link ${isActive("/") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/blog" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link to="/faq" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>FAQ</Link>
        <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/contact-us" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link to="/products" className={`mobile-nav-link ${isActive("/products") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Products</Link>
        {isAuthenticated() && (
          <Link to="/orders" className={`mobile-nav-link ${isActive("/orders") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Orders</Link>
        )}
        {isAuthenticated() && (
          <Link to="/profile" className={`mobile-nav-link ${isActive("/profile") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Profile</Link>
        )}

        <Link to="/cart" className={`mobile-nav-link ${isActive("/cart") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
          Cart {totalItems > 0 && `(${totalItems})`}
        </Link>

        <div className="mobile-divider" />

        {isAuthenticated() ? (
          <button className="mobile-btn mobile-btn-outline" onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login" className="mobile-btn mobile-btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="mobile-btn mobile-btn-fill" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </>
  );
}
 
export default Navbar;