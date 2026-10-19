import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { CartContext } from "../context/CartContext";
import { getCategoryEmoji, getCategoryLabel } from "../data/products";

const STARS   = [4.9, 4.7, 4.2, 3.8, 4.5, 4.1];
const REVIEWS = [24, 58, 312, 189, 71, 478];

function hashToIndex(id, mod) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = (hash * 31 + String(id).charCodeAt(i)) >>> 0;
  return hash % mod;
}

function Stars({ rating }) {
  return (
    <span style={{ color: "#f5c842", fontSize: 14 }}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span style={{ color: "#ddd" }}>{"★".repeat(5 - Math.ceil(rating))}</span>
    </span>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [siblings, setSiblings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const galleryRef = useRef(null);
  const scrollDebounce = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setQuantity(1);
    setAdded(false);

    API.get("/products")
      .then((res) => {
        if (cancelled) return;
        const all = res.data;
        const current = all.find((p) => p._id === id);
        if (!current) { setError(true); setLoading(false); return; }

        const baseKey = (current.baseProduct || current.name || "").toLowerCase();
        const group = all.filter(
          (p) => (p.baseProduct || p.name || "").toLowerCase() === baseKey
        );

        setSiblings(group.length > 0 ? group : [current]);
        setSelected(current);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });

    return () => { cancelled = true; };
  }, [id]);

  const scrollToIndex = (index, smooth = true) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleSelect = (sib) => {
    setSelected(sib);
    const idx = siblings.findIndex((s) => s._id === sib._id);
    if (idx >= 0) scrollToIndex(idx, true);
  };

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    if (scrollDebounce.current) clearTimeout(scrollDebounce.current);
    scrollDebounce.current = setTimeout(() => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      const next = siblings[index];
      if (next && next._id !== selected?._id) setSelected(next);
    }, 100);
  };

  useEffect(() => {
    if (loading || !selected || siblings.length === 0) return;
    const idx = siblings.findIndex((s) => s._id === selected._id);
    if (idx >= 0) scrollToIndex(idx, false);
  }, [loading, selected, siblings]);

  useEffect(() => {
    return () => {
      if (scrollDebounce.current) clearTimeout(scrollDebounce.current);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: "center", color: "#afa7e7", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        Loading product…
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div style={{ padding: 80, textAlign: "center", color: "#c0392b", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        Product not found.
        <br />
        <button
          style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e8e4f8", background: "#f0edff", color: "#8b7fd4", fontWeight: 800, cursor: "pointer" }}
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  // Description stays fixed to the representative variant (the one with the
  // richest content), regardless of which brand swatch is selected.
  const descriptionSource = siblings.find((s) => s.description) || siblings[0];
  const baseProductName = selected.baseProduct || selected.name;
  const hasVariants = siblings.length > 1;

  const seedIdx = hashToIndex(baseProductName, STARS.length);
  const stars = STARS[seedIdx];
  const reviews = REVIEWS[seedIdx];

  const handleAdd = (goToCart) => {
    for (let i = 0; i < quantity; i++) addToCart(selected);
    if (goToCart) {
      navigate("/cart");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .pd-page { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; padding:32px 60px 60px; }
        .pd-back {
          display:inline-flex; align-items:center; gap:6px;
          background:#fff; border:1.5px solid #e8e4f8; border-radius:12px;
          padding:9px 18px; font-size:13px; font-weight:800; color:#8b7fd4;
          cursor:pointer; transition:all 0.2s; margin-bottom:24px; font-family:'Nunito',sans-serif;
        }
        .pd-back:hover { background:#f0eeff; border-color:#afa7e7; transform:translateX(-2px); }

        .pd-layout { display:grid; grid-template-columns:1fr 1fr; gap:48px; max-width:1100px; }

        .pd-carousel {
          width:100%; aspect-ratio:1/1; border-radius:20px; overflow-x:auto; overflow-y:hidden;
          display:flex; scroll-snap-type:x mandatory;
          scrollbar-width:none;
        }
        .pd-carousel::-webkit-scrollbar { display:none; }
        .pd-carousel-slide {
          flex:0 0 100%; scroll-snap-align:center;
          background:linear-gradient(135deg,#f0edff,#fdf6ff);
          display:flex; align-items:center; justify-content:center;
        }
        .pd-carousel-slide img { width:100%; height:100%; object-fit:cover; }
        .pd-carousel-dots { display:flex; justify-content:center; align-items:center; gap:8px; margin-top:12px; }
        .pd-dot {
          width:8px; height:8px; border-radius:999px; border:none;
          background:#d9d5ec; cursor:pointer; transition:all 0.2s;
          padding:0;
        }
        .pd-dot.active { width:22px; background:#8b7fd4; }
        .pd-main-emoji { font-size:90px; }

        .pd-info-col { display:flex; flex-direction:column; }
        .pd-category { font-size:11px; font-weight:800; color:#afa7e7; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
        .pd-title { font-size:26px; font-weight:900; color:#2d2640; margin:0 0 10px; line-height:1.3; }
        .pd-rating-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#999; font-weight:600; margin-bottom:18px; }

        .pd-price-row { display:flex; align-items:baseline; gap:10px; margin-bottom:22px; }
        .pd-price { font-size:32px; font-weight:900; color:#2d2640; }
        .pd-price-tbd { font-size:18px; font-weight:700; color:#c3b1e1; font-style:italic; }

        .pd-section-label { font-size:12px; font-weight:800; color:#555; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; }
        .pd-swatches { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:26px; }
        .pd-swatch {
          padding:9px 16px; border-radius:12px; border:1.5px solid #e8e4f8;
          background:#fff; font-size:13px; font-weight:800; color:#555;
          cursor:pointer; transition:all 0.15s; font-family:'Nunito',sans-serif;
        }
        .pd-swatch:hover  { border-color:#afa7e7; color:#8b7fd4; }
        .pd-swatch.active { background:#f0eeff; border-color:#afa7e7; color:#8b7fd4; }

        .pd-stock { font-size:13px; font-weight:700; margin-bottom:22px; }
        .pd-stock.in  { color:#7cb668; }
        .pd-stock.low { color:#e0a030; }
        .pd-stock.out { color:#e07070; }

        .pd-qty-row { display:flex; align-items:center; gap:16px; margin-bottom:24px; }
        .pd-qty-stepper { display:flex; align-items:center; border:1.5px solid #e8e4f8; border-radius:12px; overflow:hidden; }
        .pd-qty-btn { width:36px; height:36px; border:none; background:#faf9fe; color:#8b7fd4; font-size:16px; font-weight:800; cursor:pointer; }
        .pd-qty-btn:hover { background:#f0eeff; }
        .pd-qty-val { width:44px; text-align:center; font-size:14px; font-weight:800; color:#2d2640; }

        .pd-actions { display:flex; gap:12px; }
        .pd-btn { flex:1; padding:14px; border-radius:14px; font-size:14px; font-weight:800; cursor:pointer; transition:all 0.2s; font-family:'Nunito',sans-serif; border:none; }
        .pd-btn-cart { background:#f5f3ff; border:1.5px solid #e8e4f8; color:#8b7fd4; }
        .pd-btn-cart:hover { background:linear-gradient(135deg,#C3B1E1,#afa7e7); color:#fff; border-color:transparent; }
        .pd-btn-cart.added { background:linear-gradient(135deg,#B5D99C,#9dcc82); color:#fff; border-color:transparent; }
        .pd-btn-buy { background:linear-gradient(135deg,#2d2640,#3d3460); color:#fff; box-shadow:0 6px 20px rgba(45,38,64,0.25); }
        .pd-btn-buy:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(45,38,64,0.35); }

        .pd-description { margin-top:36px; padding-top:28px; border-top:1.5px solid #f0eeff; }
        .pd-description h3 { font-size:15px; font-weight:900; color:#2d2640; margin:0 0 10px; }
        .pd-description p  { font-size:14px; color:#666; line-height:1.7; margin:0; }

        @media (max-width:900px) {
          .pd-page { padding:20px; }
          .pd-layout { grid-template-columns:1fr; gap:24px; }
        }
      `}</style>

      <div className="pd-page">
        <button className="pd-back" onClick={() => navigate("/products")}>← Back to Products</button>

        <div className="pd-layout">
          <div>
            <div className="pd-carousel" ref={galleryRef} onScroll={handleGalleryScroll}>
              {siblings.map((s) => (
                <div key={s._id} className="pd-carousel-slide">
                  {s.image
                    ? <img src={s.image} alt={s.brand || s.name} />
                    : <span className="pd-main-emoji">{s.emoji || "🛍️"}</span>}
                </div>
              ))}
            </div>
            <div className="pd-carousel-dots">
              {siblings.map((s) => (
                <button
                  key={s._id}
                  className={`pd-dot ${selected._id === s._id ? "active" : ""}`}
                  onClick={() => handleSelect(s)}
                />
              ))}
            </div>
          </div>

          <div className="pd-info-col">
            {selected.category && (
              <div className="pd-category">
                {getCategoryEmoji(selected.category)} {getCategoryLabel(selected.category)}
              </div>
            )}
            <h1 className="pd-title">{baseProductName}</h1>
            <div className="pd-rating-row">
              <Stars rating={stars} /><span>{stars} ({reviews} reviews)</span>
            </div>

            <div className="pd-price-row">
              {selected.price
                ? <span className="pd-price">KES {selected.price}</span>
                : <span className="pd-price-tbd">Price coming soon</span>}
            </div>

            {hasVariants && (
              <>
                <div className="pd-section-label">Brand</div>
                <div className="pd-swatches">
                  {siblings.map((s) => (
                    <button
                      key={s._id}
                      className={`pd-swatch ${selected._id === s._id ? "active" : ""}`}
                      onClick={() => handleSelect(s)}
                    >
                      {s.brand || s.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {typeof selected.stock === "number" && (
              <div className={`pd-stock ${selected.stock === 0 ? "out" : selected.stock <= 5 ? "low" : "in"}`}>
                {selected.stock === 0
                  ? "Out of stock"
                  : selected.stock <= 5
                  ? `Only ${selected.stock} left in stock`
                  : "In stock"}
              </div>
            )}

            <div className="pd-qty-row">
              <div className="pd-section-label" style={{ marginBottom: 0 }}>Quantity</div>
              <div className="pd-qty-stepper">
                <button className="pd-qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="pd-qty-val">{quantity}</span>
                <button className="pd-qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            <div className="pd-actions">
              <button
                className={`pd-btn pd-btn-cart ${added ? "added" : ""}`}
                disabled={selected.stock === 0}
                onClick={() => handleAdd(false)}
              >
                {added ? "✓ Added!" : "🛒 Add to Cart"}
              </button>
              <button
                className="pd-btn pd-btn-buy"
                disabled={selected.stock === 0}
                onClick={() => handleAdd(true)}
              >
                Buy Now
              </button>
            </div>

            <div className="pd-description">
              <h3>Description</h3>
              <p>{descriptionSource?.description || "No description available yet for this product."}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
