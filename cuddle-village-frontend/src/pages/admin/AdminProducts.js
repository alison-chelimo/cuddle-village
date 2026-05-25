import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";
import { useNavigate } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, productId: null, productName: "" });
  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
  try {
    const res = await API.get("/products");
    // Normalize missing stock/price so comparisons work correctly
    const normalized = res.data.map((p) => ({
      ...p,
      stock: p.stock ?? 0,
      price: p.price ?? 0,
    }));
    setProducts(normalized);     
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/products/${deleteConfirm.productId}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm({ open: false, productId: null, productName: "" });
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .products-wrap * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

        .products-table-row { transition: background 0.15s; }
        .products-table-row:hover { background: #f5f2ff !important; }

        .action-btn {
          border: none; border-radius: 8px; padding: 7px 14px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .btn-edit { background: #f0edff; color: #8b7fd4; border: 1.5px solid #e8e4f8; }
        .btn-edit:hover { background: #afa7e7; color: #fff; transform: translateY(-1px); }
        .btn-delete { background: #fff3f3; color: #c0392b; border: 1.5px solid #e8a0a055; }
        .btn-delete:hover { background: #e87070; color: #fff; transform: translateY(-1px); }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #e8e4f8; border-radius: 12px;
          padding: 9px 18px; font-size: 13px; font-weight: 800; color: #8b7fd4;
          cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; margin-bottom: 28px;
        }
        .back-btn:hover { background: #f0eeff; border-color: #afa7e7; transform: translateX(-2px); }

        .add-product-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7); border: none;
          border-radius: 12px; padding: 11px 20px; font-size: 14px; font-weight: 800;
          color: #fff; cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; box-shadow: 0 6px 20px rgba(175,167,231,0.4);
          white-space: nowrap;
        }
        .add-product-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(175,167,231,0.5); }

        .search-input {
          padding: 11px 16px 11px 40px; border: 1.5px solid #e8e4f8;
          border-radius: 12px; font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          background: #faf9fe; transition: all 0.2s; width: 100%;
        }
        .search-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
        .search-input::placeholder { color: #ccc; }

        .stat-mini {
          background: #fff; border-radius: 16px; padding: 20px 24px;
          border: 1.5px solid #f0edff; box-shadow: 0 4px 16px rgba(175,167,231,0.1);
          display: flex; align-items: center; gap: 14px;
        }
        .stat-mini-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .product-img {
          width: 44px; height: 44px; border-radius: 10px; object-fit: cover;
          border: 1.5px solid #f0edff; background: #faf9fe; flex-shrink: 0;
        }
        .product-img-placeholder {
          width: 44px; height: 44px; border-radius: 10px; background: #f0edff;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        /* ── Mobile product card ── */
        .product-mobile-card {
          background: #fff; border-radius: 16px; padding: 16px;
          border: 1.5px solid #f0edff;
          box-shadow: 0 2px 12px rgba(175,167,231,0.08);
          display: flex; flex-direction: column; gap: 12px;
        }
        .product-mobile-card-top {
          display: flex; align-items: center; gap: 12px;
        }
        .product-mobile-card-info { flex: 1; min-width: 0; }
        .product-mobile-card-name {
          font-size: 14px; font-weight: 800; color: #2d2640;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .product-mobile-card-id {
          font-size: 11px; font-weight: 600; color: #bbb; margin-top: 2px;
        }
        .product-mobile-card-meta {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px;
        }
        .product-mobile-card-actions {
          display: flex; gap: 8px;
        }

        /* Show/hide per breakpoint */
        .desktop-only { display: block; }
        .mobile-only  { display: none;  }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: block !important; }
          .stats-mini-grid { grid-template-columns: 1fr 1fr !important; }
          .products-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .products-header h1 { font-size: 26px !important; }
        }
      `}</style>

      <AdminLayout>
        <div className="products-wrap">

          <button className="back-btn" onClick={() => navigate("/admin/admin-dashboard")}>
            ← Back to Dashboard
          </button>

          <div className="products-header" style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0edff", border: "1.5px solid #e8e4f8",
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: "#8b7fd4",
              marginBottom: 10, letterSpacing: "0.5px",
            }}>
              🛍️ Product Management
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2d2640", margin: "0 0 6px" }}>
              All Products
            </h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0, fontWeight: 600 }}>
              Manage your store inventory
            </p>
          </div>

          {/* Mini stats */}
          <div className="stats-mini-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16, marginBottom: 28,
          }}>
            {[
              { icon: "🛍️", label: "Total Products", value: products.length,                                  bg: "#f0edff", color: "#8b7fd4" },
              { icon: "⚠️", label: "Low Stock",       value: lowStock,                                        bg: "#fff8ec", color: "#d48a0a" },
              { icon: "✅", label: "In Stock",        value: products.filter(p => p.stock > 5).length,        bg: "#edfaf4", color: "#1a7a4a" },
              { icon: "❌", label: "Out of Stock",    value: products.filter(p => p.stock === 0).length,      bg: "#fff3f3", color: "#c0392b" },
            ].map((s) => (
              <div className="stat-mini" key={s.label}>
                <div className="stat-mini-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main card */}
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1.5px solid #f0edff",
            boxShadow: "0 4px 20px rgba(175,167,231,0.1)",
            overflow: "hidden",
          }}>
            {/* Toolbar */}
            <div className="products-toolbar" style={{
              padding: "20px 24px", borderBottom: "1.5px solid #f0edff",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
                }}>🔍</span>
                <input
                  className="search-input"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="add-product-btn" onClick={() => navigate("/admin/products/add")}>
                ➕ Add Product
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#afa7e7", fontWeight: 700 }}>Loading products…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#bbb", fontWeight: 700 }}>
                {search ? "No products match your search" : "No products found"}
              </div>
            ) : (
              <div className="products-table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#faf9fe" }}>
                      {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                        <th key={h} style={{
                          padding: "12px 20px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#aaa",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          borderBottom: "1.5px solid #f0edff",
                          whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => {
                      const stockLow = p.stock <= 5 && p.stock > 0;
                      const stockOut = p.stock === 0;
                      return (
                        <tr
                          key={p._id}
                          className="products-table-row"
                          style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}
                        >
                          {/* Product */}
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="product-img" />
                              ) : (
                                <div className="product-img-placeholder">🧸</div>
                              )}
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640" }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", marginTop: 2 }}>
                                  ID: {p._id?.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                            {p.category ? (
                              <span style={{
                                background: "#f0edff", color: "#8b7fd4",
                                border: "1.5px solid #e8e4f8",
                                borderRadius: 20, padding: "4px 10px",
                                fontSize: 12, fontWeight: 700,
                              }}>
                                {p.category}
                              </span>
                            ) : (
                              <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
                            )}
                          </td>

                          {/* Price */}
                          <td style={{ padding: "14px 20px", fontSize: 15, fontWeight: 900, color: "#2d2640", borderBottom: "1px solid #f5f3ff" }}>
                            KES {(p.price || 0).toLocaleString()}
                          </td>

                          {/* Stock */}
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              background: stockOut ? "#fff3f3" : stockLow ? "#fff8ec" : "#edfaf4",
                              color: stockOut ? "#c0392b" : stockLow ? "#d48a0a" : "#1a7a4a",
                              border: `1.5px solid ${stockOut ? "#e8a0a055" : stockLow ? "#f7c94855" : "#34c77b55"}`,
                              borderRadius: 20, padding: "5px 12px",
                              fontSize: 12, fontWeight: 800,
                            }}>
                              <span style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: stockOut ? "#e87070" : stockLow ? "#f7c948" : "#34c77b",
                                display: "inline-block",
                              }} />
                              {stockOut ? "Out of stock" : `${p.stock} left`}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                className="action-btn btn-edit"
                                onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="action-btn btn-delete"
                                onClick={() => setDeleteConfirm({ open: true, productId: p._id, productName: p.name })}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete Product?"
        message={`"${deleteConfirm.productName}" will be permanently removed from the store. This cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, productId: null, productName: "" })}
        danger
      />
    </>
  );
}

export default AdminProducts;