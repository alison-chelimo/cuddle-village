import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo1.JPG";

function Home() {
  const categories = [
    { name: "Baby", emoji: "🍼", color: "#e8f4fd", accent: "#A7C7E7", count: "120+ items" },
    { name: "Books", emoji: "📚", color: "#fff4f0", accent: "#FBC4AB", count: "85+ items" },
    { name: "Wellness", emoji: "🌿", color: "#f3fae8", accent: "#B5D99C", count: "60+ items" },
  ];

  const highlights = [
    { label: "Free Shipping", icon: "🚚", desc: "Orders over KES 2,000" },
    { label: "Verified Quality", icon: "✅", desc: "Curated just for you" },
    { label: "Easy Returns", icon: "↩️", desc: "Hassle-free returns" },
    { label: "24/7 Support", icon: "💬", desc: "Always here to help" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .home {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #f0edff 0%, #fdf6ff 50%, #fff4f0 100%);
          padding: 70px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          min-height: 420px;
          overflow: hidden;
          position: relative;
        }

        .hero::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(195,177,225,0.2), transparent 70%);
          top: -100px;
          right: 100px;
          border-radius: 50%;
        }

        .hero-content {
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1.5px solid #e8e4f8;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          color: #8b7fd4;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 900;
          color: #2d2640;
          line-height: 1.15;
          margin: 0 0 16px;
        }

        .hero-title span {
          color: #afa7e7;
        }

        .hero-subtitle {
          font-size: 16px;
          color: #777;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          padding: 14px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(175,167,231,0.4);
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(175,167,231,0.5);
        }

        .btn-secondary {
          color: #8b7fd4;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: gap 0.2s;
        }

        .btn-secondary:hover { gap: 10px; }

        .hero-image {
          flex-shrink: 0;
          width: 300px;
          height: 300px;
          background: #fff;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(175,167,231,0.25);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 20px;
        }

        /* HIGHLIGHTS */
        .highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          background: #2d2640;
          padding: 0 60px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }

        .highlight-item:last-child { border-right: none; }

        .highlight-icon {
          font-size: 22px;
          flex-shrink: 0;
        }

        .highlight-label {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
        }

        .highlight-desc {
          font-size: 11px;
          color: #aaa;
        }

        /* CATEGORIES */
        .section {
          padding: 60px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 28px;
        }

        .section-title {
          font-size: 26px;
          font-weight: 900;
          color: #2d2640;
          margin: 0;
        }

        .section-link {
          color: #afa7e7;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .category-card {
          border-radius: 20px;
          padding: 32px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }

        .category-left .cat-emoji {
          font-size: 36px;
          margin-bottom: 12px;
          display: block;
        }

        .category-left .cat-name {
          font-size: 20px;
          font-weight: 800;
          color: #2d2640;
          margin: 0 0 4px;
        }

        .category-left .cat-count {
          font-size: 12px;
          color: #888;
          font-weight: 600;
        }

        .cat-arrow {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: rgba(255,255,255,0.7);
        }

        /* FEATURED GRID */
        .featured-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .featured-card {
          background: linear-gradient(135deg, #f0edff, #e8e4f8);
          border-radius: 20px;
          padding: 36px;
          position: relative;
          overflow: hidden;
          min-height: 200px;
        }

        .featured-card.peach {
          background: linear-gradient(135deg, #fff4f0, #fde8de);
        }

        .featured-card-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #afa7e7;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .featured-card.peach .featured-card-tag {
          color: #e8956d;
        }

        .featured-card-title {
          font-size: 22px;
          font-weight: 900;
          color: #2d2640;
          margin: 0 0 8px;
          max-width: 200px;
        }

        .featured-card-desc {
          font-size: 13px;
          color: #777;
          line-height: 1.5;
          max-width: 220px;
          margin-bottom: 20px;
        }

        .featured-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #8b7fd4;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transition: all 0.2s;
        }

        .featured-card-btn:hover {
          background: #2d2640;
          color: #fff;
          transform: translateY(-1px);
        }

        .featured-card-emoji {
          position: absolute;
          right: 30px;
          bottom: 20px;
          font-size: 72px;
          opacity: 0.3;
        }

        .btn-primary:focus-visible,
        .btn-secondary:focus-visible,
        .category-card:focus-visible,
        .featured-card-btn:focus-visible {
          outline: 3px solid #afa7e7;
          outline-offset: 3px;
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            padding: 40px 24px;
            min-height: unset;
            text-align: center;
          }
          .hero-actions { justify-content: center; }
          .hero-image { width: 200px; height: 200px; }
          .highlights {
            grid-template-columns: 1fr 1fr;
            padding: 0;
          }
          .highlight-item {
            padding: 16px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .section { padding: 40px 24px; }
          .categories-grid { grid-template-columns: 1fr; }
          .featured-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .highlights { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="home">
        {/* HERO */}
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">✨ New Season Arrivals</div>
            <h1 className="hero-title">
              Everything your <span>little one</span> needs
            </h1>
            <p className="hero-subtitle">
              Thoughtfully curated baby essentials, enriching books, and wellness products — all in one cozy place.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">Browse Items</Link>
              <Link to="/products" className="btn-secondary">See All Categories →</Link>
            </div>
          </div>
 
          <div className="hero-image">
            <img src={logo} alt="The Cuddle Village" />
          </div>
        </div>

        {/* HIGHLIGHTS BAR */}
        <div className="highlights">
          {highlights.map((h, i) => (
            <div className="highlight-item" key={i}>
              <span className="highlight-icon">{h.icon}</span>
              <div>
                <div className="highlight-label">{h.label}</div>
                <div className="highlight-desc">{h.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="section-link">View All →</Link>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                to="/products"
                className="category-card"
                key={cat.name}
                style={{ background: cat.color }}
              >
                <div className="category-left">
                  <span className="cat-emoji">{cat.emoji}</span>
                  <p className="cat-name">{cat.name}</p>
                  <p className="cat-count">{cat.count}</p>
                </div>
                <div className="cat-arrow" style={{ color: cat.accent }}>→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* FEATURED BANNERS */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2 className="section-title">Featured Collections</h2>
          </div>
          <div className="featured-grid">
            <div className="featured-card">
              <div className="featured-card-tag">New Season</div>
              <div className="featured-card-title">Baby Essentials Lookbook</div>
              <div className="featured-card-desc">Everything you need for a comfortable start — soft, safe, and sweet.</div>
              <Link to="/products" className="featured-card-btn">Explore Collection →</Link>
              <div className="featured-card-emoji">🧸</div>
            </div>
            <div className="featured-card peach">
              <div className="featured-card-tag">Hand-Picked</div>
              <div className="featured-card-title">Wellness for Mums & Babies</div>
              <div className="featured-card-desc">Natural, gentle, and trusted products for the whole family.</div>
              <Link to="/products" className="featured-card-btn">Shop Now →</Link>
              <div className="featured-card-emoji">🌸</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;