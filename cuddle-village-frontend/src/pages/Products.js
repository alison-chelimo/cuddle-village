import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { CartContext } from "../context/CartContext";
import { CATEGORIES, CATALOG, FLAT_PRODUCTS, getSubcategories } from "../data/products";

// ─── Seeded display helpers (unchanged from your original) ────────────────────
const BADGES       = ["Sale", "New", "Hot", null, "-35%", null, "Best Seller", null];
const BADGE_COLORS = { Sale: "#FBC4AB", New: "#B5D99C", Hot: "#afa7e7", "-35%": "#e88a8a", "Best Seller": "#f5c842" };
const METAS        = ["Premium Collection", "Best Seller", "New Arrival", "Editor's Pick", "Trending Now", "Hand-Picked"];
const STARS        = [4.9, 4.7, 4.2, 3.8, 4.5, 4.1];
const REVIEWS      = [24, 58, 312, 189, 71, 478];
const DISCOUNTS    = [null, 0.3, null, 0.25, null, 0.15, 0.4, null];

function Stars({ rating }) {
  return (
    <span style={{ color: "#f5c842", fontSize: 12 }}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span style={{ color: "#ddd" }}>{"★".repeat(5 - Math.ceil(rating))}</span>
    </span>
  );
}

// Placeholder: emoji + name when no image is set yet
function ProductImageBox({ product, height = 175 }) {
  if (product.image) {
    return (
      <div className="product-image-box" style={{ height }}>
        <img src={product.image} alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className="product-image-box" style={{ height }}>
      <div className="placeholder-inner">
        <span className="placeholder-emoji">{product.emoji || "🛍️"}</span>
        <span className="placeholder-name">{product.name}</span>
      </div>
    </div>
  );
}

// Enrich API products with catalog metadata (emoji, category) by name-matching
function enrichProduct(p) {
  const match = FLAT_PRODUCTS.find(fp => fp.name.toLowerCase() === p.name?.toLowerCase());
  return { ...match, ...p, emoji: p.emoji ?? match?.emoji ?? "🛍️" };
}

const TABS = ["All", "Trending Now", "Highest Rated", "New Arrivals", "Hand-Picked"];

export default function Products() {
  const [activeTab, setActiveTab]           = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSub, setActiveSub]           = useState(null);
  const { addToCart }                       = useContext(CartContext);
  const [addedIds, setAddedIds]             = useState({});

  const [allProducts, setAllProducts] = useState(FLAT_PRODUCTS); // ← show catalog immediately

  useEffect(() => {
    API.get("/products")
      .then(res => {
        const enriched = res.data.map(enrichProduct);
        if (enriched.length > 0) setAllProducts(enriched); // only swap if API returns real data
      })
      .catch(() => {}); // silently keep showing FLAT_PRODUCTS
  }, []);

  const handleCategoryClick = (catId) => { setActiveCategory(catId); setActiveSub(null); };

  const filtered = allProducts.filter(p => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (activeSub && p.subcategory !== activeSub) return false;
    return true;
  });

  const handleAdd = (e, product) => {
    e.preventDefault();
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product._id]: false })), 1800);
  };

  const subcategories = getSubcategories(activeCategory);
  const activeCatObj  = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .products-page { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; }

        /* Hero */
        .products-hero { background:linear-gradient(135deg,#2d2640,#3d3460); padding:50px 60px; color:#fff; }
        .products-hero h1 { font-size:36px; font-weight:900; margin:0 0 8px; }
        .products-hero p  { font-size:15px; color:#bbb; margin:0; }

        /* Tabs */
        .products-tabs {
          display:flex; gap:4px; padding:0 60px;
          border-bottom:2px solid #eee; background:#fff; overflow-x:auto;
        }
        .tab-btn {
          padding:14px 18px; border-radius:10px 10px 0 0; border:none;
          background:transparent; font-size:13px; font-weight:700; color:#888;
          cursor:pointer; transition:all 0.2s; font-family:'Nunito',sans-serif;
          border-bottom:3px solid transparent; margin-bottom:-2px; white-space:nowrap;
        }
        .tab-btn:hover  { color:#afa7e7; }
        .tab-btn.active { color:#8b7fd4; border-bottom-color:#afa7e7; background:#f8f6ff; }

        /* Body layout */
        .products-body { display:grid; grid-template-columns:240px 1fr; align-items:start; }

        /* Sidebar */
        .products-sidebar {
          position:sticky; top:0;
          height:calc(100vh - 140px); overflow-y:auto;
          padding:28px 16px; border-right:1.5px solid #f0eeff; background:#fff;
        }
        .sidebar-title {
          font-size:10px; font-weight:900; letter-spacing:1px;
          text-transform:uppercase; color:#c3b1e1;
          margin-bottom:10px; padding-left:8px;
        }
        .sidebar-cat {
          display:flex; align-items:center; gap:9px;
          padding:9px 12px; border-radius:12px;
          font-size:13px; font-weight:700; color:#555;
          cursor:pointer; transition:all 0.15s;
          margin-bottom:2px; border:none; background:transparent;
          width:100%; text-align:left; font-family:'Nunito',sans-serif;
        }
        .sidebar-cat:hover  { background:#f5f2ff; color:#8b7fd4; }
        .sidebar-cat.active { background:#f0eeff; color:#8b7fd4; font-weight:900; }
        .sidebar-cat-emoji  { font-size:16px; flex-shrink:0; }
        .sidebar-cat-count  {
          margin-left:auto; font-size:10px; font-weight:800; color:#c3b1e1;
          background:#f5f2ff; padding:2px 7px; border-radius:20px;
        }
        .sidebar-subs { margin:3px 0 6px 30px; }
        .sidebar-sub {
          display:block; padding:6px 10px; border-radius:8px;
          font-size:12px; font-weight:700; color:#999;
          cursor:pointer; transition:all 0.15s; margin-bottom:1px;
          border:none; background:transparent; width:100%; text-align:left;
          font-family:'Nunito',sans-serif;
        }
        .sidebar-sub:hover  { background:#faf9ff; color:#8b7fd4; }
        .sidebar-sub.active { background:#ede9ff; color:#6b5fc7; font-weight:900; }

        /* Mobile category bar */
        .mobile-cat-bar {
          display:none; padding:12px 20px; gap:8px;
          overflow-x:auto; background:#fff; border-bottom:1.5px solid #f0eeff;
        }
        .mobile-cat-pill {
          display:flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:20px;
          font-size:12px; font-weight:800; white-space:nowrap;
          border:1.5px solid #e8e4f8; background:#fff; color:#888;
          cursor:pointer; transition:all 0.15s; font-family:'Nunito',sans-serif;
        }
        .mobile-cat-pill.active { background:#f0eeff; border-color:#afa7e7; color:#8b7fd4; }

        /* Grid area */
        .products-grid-area { padding:28px 32px; }
        .grid-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .grid-header h2 { font-size:20px; font-weight:900; color:#2d2640; margin:0 0 2px; }
        .grid-header p  { font-size:12px; color:#aaa; font-weight:600; margin:0; }

        /* Subcategory pills */
        .sub-pills { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; }
        .sub-pill {
          padding:6px 14px; border-radius:20px;
          font-size:12px; font-weight:800; color:#888;
          border:1.5px solid #e8e4f8; background:#fff;
          cursor:pointer; transition:all 0.15s; font-family:'Nunito',sans-serif;
        }
        .sub-pill:hover  { border-color:#afa7e7; color:#8b7fd4; }
        .sub-pill.active { background:#f0eeff; border-color:#afa7e7; color:#8b7fd4; }

        /* Product grid */
        .products-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(195px,1fr));
          gap:20px;
        }
        .product-card {
          background:#fff; border-radius:20px; overflow:hidden;
          text-decoration:none; color:inherit; transition:all 0.25s;
          box-shadow:0 2px 12px rgba(0,0,0,0.04);
          border:1.5px solid #f0f0f0; position:relative;
        }
        .product-card:hover {
          transform:translateY(-5px);
          box-shadow:0 18px 44px rgba(175,167,231,0.2);
          border-color:#e4dffa;
        }
        .product-badge {
          position:absolute; top:12px; left:12px; z-index:1;
          color:#fff; font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:20px; letter-spacing:0.4px;
        }

        /* Placeholder */
        .product-image-box {
          width:100%; background:linear-gradient(135deg,#f0edff,#fdf6ff);
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; transition:transform 0.3s;
        }
        .product-card:hover .product-image-box { transform:scale(1.03); }
        .placeholder-inner {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:8px; padding:16px;
          text-align:center; height:100%; width:100%;
        }
        .placeholder-emoji { font-size:46px; line-height:1; }
        .placeholder-name  {
          font-size:11px; font-weight:800; color:#b5aee0;
          line-height:1.3; max-width:120px;
        }

        /* Card body */
        .product-info    { padding:12px 14px 14px; }
        .product-meta    { font-size:10px; font-weight:800; color:#afa7e7; letter-spacing:1px; text-transform:uppercase; margin-bottom:4px; }
        .product-name    { font-size:13px; font-weight:800; color:#2d2640; margin:0 0 5px; line-height:1.3; }
        .product-rating  { display:flex; align-items:center; gap:5px; font-size:11px; color:#bbb; font-weight:600; margin-bottom:8px; }
        .product-pricing { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
        .product-price     { font-size:16px; font-weight:900; color:#2d2640; }
        .product-price-tbd { font-size:13px; font-weight:700; color:#c3b1e1; font-style:italic; }
        .product-price-old { font-size:11px; color:#ccc; text-decoration:line-through; font-weight:600; }
        .add-to-cart-btn {
          width:100%; padding:9px; background:#f5f3ff;
          border:1.5px solid #e8e4f8; border-radius:10px;
          font-size:12px; font-weight:800; color:#8b7fd4;
          cursor:pointer; transition:all 0.2s; font-family:'Nunito',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:5px;
        }
        .add-to-cart-btn:hover {
          background:linear-gradient(135deg,#C3B1E1,#afa7e7);
          color:#fff; border-color:transparent;
          box-shadow:0 4px 14px rgba(175,167,231,0.4);
        }
        .add-to-cart-btn.added { background:linear-gradient(135deg,#B5D99C,#9dcc82); color:#fff; border-color:transparent; }

        /* Empty */
        .empty-state { text-align:center; padding:80px 20px; color:#bbb; }
        .empty-state .emoji { font-size:56px; margin-bottom:16px; }
        .empty-state h3 { font-size:18px; color:#888; font-weight:700; }

        /* Responsive */
        @media (max-width:900px) {
          .products-body { grid-template-columns:1fr; }
          .products-sidebar { display:none; }
          .mobile-cat-bar { display:flex; }
          .products-hero { padding:36px 24px; }
          .products-tabs { padding:0 20px; }
          .products-grid-area { padding:20px; }
        }
        @media (max-width:480px) {
          .products-hero h1 { font-size:26px; }
          .products-grid { grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:12px; }
          .placeholder-emoji { font-size:36px; }
        }
      `}</style>

      <div className="products-page">

        {/* Hero */}
        <div className="products-hero">
          <h1>🛍️ Our Products</h1>
          <p>Discover everything curated with love for your little one</p>
        </div>

        {/* Tabs */}
        <div className="products-tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "Trending Now" && "🔥 "}{tab === "Highest Rated" && "⭐ "}
              {tab === "New Arrivals" && "✨ "}{tab === "Hand-Picked"   && "🤍 "}
              {tab}
            </button>
          ))}
        </div>

        {/* Mobile category pills */}
        <div className="mobile-cat-bar">
          {CATEGORIES.map(cat => (
            <button key={cat.id} className={`mobile-cat-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat.id)}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <div className="products-body">

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside className="products-sidebar">
            <div className="sidebar-title">Shop by Category</div>
            {CATEGORIES.map(cat => {
              const catData = CATALOG.find(c => c.id === cat.id);
              const count   = cat.id === "all"
                ? allProducts.length
                : allProducts.filter(p => p.category === cat.id).length;
              return (
                <div key={cat.id}>
                  <button className={`sidebar-cat ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => handleCategoryClick(cat.id)}>
                    <span className="sidebar-cat-emoji">{cat.emoji}</span>
                    {cat.label}
                    <span className="sidebar-cat-count">{count}</span>
                  </button>
                  {activeCategory === cat.id && catData && catData.subcategories.length > 1 && (
                    <div className="sidebar-subs">
                      <button className={`sidebar-sub ${activeSub === null ? "active" : ""}`}
                        onClick={() => setActiveSub(null)}>All {cat.label}</button>
                      {catData.subcategories.map(sub => (
                        <button key={sub.id} className={`sidebar-sub ${activeSub === sub.id ? "active" : ""}`}
                          onClick={() => setActiveSub(sub.id)}>{sub.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* ── Grid ─────────────────────────────────────────────── */}
          <div className="products-grid-area">
            <div className="grid-header">
              <div>
                <h2>{activeCatObj?.emoji} {activeCatObj?.label ?? "All Products"}</h2>
                <p>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Subcategory pills */}
            {subcategories.length > 1 && (
              <div className="sub-pills">
                <button className={`sub-pill ${activeSub === null ? "active" : ""}`}
                  onClick={() => setActiveSub(null)}>All</button>
                {subcategories.map(sub => (
                  <button key={sub.id} className={`sub-pill ${activeSub === sub.id ? "active" : ""}`}
                    onClick={() => setActiveSub(sub.id)}>{sub.label}</button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="emoji">🛍️</div>
                <h3>No products here yet — check back soon!</h3>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map((product, i) => {
                  const badge    = BADGES[i % BADGES.length];
                  const meta     = METAS[i % METAS.length];
                  const stars    = STARS[i % STARS.length];
                  const reviews  = REVIEWS[i % REVIEWS.length];
                  const discount = DISCOUNTS[i % DISCOUNTS.length];
                  const oldPrice = product.price && discount ? Math.round(product.price / (1 - discount)) : null;
                  const isAdded  = addedIds[product._id];
                  return (
                    <Link key={product._id} to={`/products/${product._id}`} className="product-card">
                      {badge && (
                        <span className="product-badge" style={{ background: BADGE_COLORS[badge] || "#afa7e7" }}>
                          {badge}
                        </span>
                      )}
                      <ProductImageBox product={product} height={175} />
                      <div className="product-info">
                        <div className="product-meta">{meta}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-rating"><Stars rating={stars} /><span>{stars} ({reviews})</span></div>
                        <div className="product-pricing">
                          {product.price
                            ? <><span className="product-price">KES {product.price}</span>{oldPrice && <span className="product-price-old">KES {oldPrice}</span>}</>
                            : <span className="product-price-tbd">Price coming soon</span>
                          }
                        </div>
                        <button className={`add-to-cart-btn ${isAdded ? "added" : ""}`}
                          onClick={(e) => handleAdd(e, product)}>
                          {isAdded ? "✓ Added!" : "🛒 Add to Cart"}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}