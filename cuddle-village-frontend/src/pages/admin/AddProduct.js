// ─── AddProduct.jsx ──────────────────────────────────────────────────────────
import React, { useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Electronics", "Clothing", "Food & Drinks", "Home & Living",
  "Beauty & Health", "Sports & Outdoors", "Toys & Games",
  "Books & Stationery", "Other",
];

export function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "", stock: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      if (image) data.append("image", image);
      await API.post("/products", data);
      alert("Product added!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{formStyles}</style>
      <AdminLayout>
        <div className="form-page-wrap">
          <button className="form-back-btn" onClick={() => navigate("/admin/products")}>
            ← Back to Products
          </button>
          <div className="form-card">
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div className="form-badge">➕ New Product</div>
              <h1 className="form-heading">Add Product</h1>
              <p className="form-subheading">Fill in the details to list a new product</p>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <label className="form-label">
                  Product Name <span className="required">*</span>
                  <input className="form-input" placeholder="e.g. Wireless Headphones" required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="form-label">
                  Price (KES) <span className="required">*</span>
                  <input className="form-input" type="number" placeholder="e.g. 2500" required min="0"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </label>
              </div>
              <div className="form-row">
                <label className="form-label">
                  Category
                  <select className="form-select" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="" disabled>Select a category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="form-label">
                  Stock Quantity
                  <input className="form-input" type="number" placeholder="e.g. 50" min="0"
                    value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </label>
              </div>
              <label className="form-label">
                Description
                <textarea className="form-textarea" placeholder="Describe the product…"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="form-label">
                Product Image
                <div className="file-input-wrap">
                  <span className="file-input-icon">🖼️</span>
                  <span className="file-input-text">{image ? image.name : "Click to upload image"}</span>
                  <input type="file" accept="image/*" className="file-input-hidden"
                    onChange={(e) => setImage(e.target.files[0])} />
                </div>
              </label>
              <button className="form-submit-btn" type="submit" disabled={loading}>
                {loading ? "Adding…" : "➕ Add Product"}
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default AddProduct;


// ─── EditProduct.jsx ─────────────────────────────────────────────────────────
// (copy this into a separate EditProduct.jsx file)
/*
import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

const CATEGORIES = [
  "Electronics", "Clothing", "Food & Drinks", "Home & Living",
  "Beauty & Health", "Sports & Outdoors", "Toys & Games",
  "Books & Stationery", "Other",
];

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "", stock: "", image: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { fetchProduct(); }, []);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setForm({
        name: res.data.name || "", price: res.data.price || "",
        description: res.data.description || "", category: res.data.category || "",
        stock: res.data.stock || "", image: res.data.image || "",
      });
    } catch (err) { console.error(err); setError(true); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      if (image) data.append("image", image);
      await API.put(`/products/${id}`, data);
      alert("Product updated!");
      navigate("/admin/products");
    } catch (err) { console.error(err); alert("Update failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><div style={{ padding: 60, textAlign: "center", color: "#afa7e7", fontWeight: 700 }}>Loading product…</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 60, textAlign: "center", color: "#c0392b", fontWeight: 700 }}>Failed to load product</div></AdminLayout>;

  return (
    <>
      <style>{formStyles}</style>
      <AdminLayout>
        <div className="form-page-wrap">
          <button className="form-back-btn" onClick={() => navigate("/admin/products")}>← Back to Products</button>
          <div className="form-card">
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div className="form-badge">✏️ Edit Product</div>
              <h1 className="form-heading">Edit Product</h1>
              <p className="form-subheading">Update the product details below</p>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <label className="form-label">Product Name <span className="required">*</span>
                  <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="form-label">Price (KES) <span className="required">*</span>
                  <input className="form-input" type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </label>
              </div>
              <div className="form-row">
                <label className="form-label">Category
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="" disabled>Select a category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="form-label">Stock Quantity
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </label>
              </div>
              <label className="form-label">Description
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              {form.image && <img src={form.image} alt="product" style={{ width: 100, borderRadius: 10, marginBottom: 4, border: "1.5px solid #f0edff" }} />}
              <label className="form-label">Product Image
                <div className="file-input-wrap">
                  <span className="file-input-icon">🖼️</span>
                  <span className="file-input-text">{image ? image.name : "Click to replace image"}</span>
                  <input type="file" accept="image/*" className="file-input-hidden" onChange={(e) => setImage(e.target.files[0])} />
                </div>
              </label>
              <button className="form-submit-btn" type="submit" disabled={saving}>{saving ? "Saving…" : "✅ Update Product"}</button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default EditProduct;
*/


// ─── Shared form styles (used by both AddProduct and EditProduct) ─────────────
export const formStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .form-page-wrap { max-width: 640px; margin: 0 auto; padding-bottom: 40px; }
  .form-page-wrap * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

  .form-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #e8e4f8; border-radius: 12px;
    padding: 9px 18px; font-size: 13px; font-weight: 800; color: #8b7fd4;
    cursor: pointer; transition: all 0.2s; margin-bottom: 24px;
  }
  .form-back-btn:hover { background: #f0eeff; border-color: #afa7e7; transform: translateX(-2px); }

  .form-card {
    background: #fff; border-radius: 20px;
    box-shadow: 0 4px 24px rgba(175,167,231,0.12);
    border: 1.5px solid #f0edff; padding: 36px 32px 32px;
  }

  .form-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0edff; border: 1.5px solid #e8e4f8; border-radius: 20px;
    padding: 6px 14px; font-size: 12px; font-weight: 700; color: #8b7fd4;
    margin-bottom: 10px; letter-spacing: 0.5px;
  }
  .form-heading {
    font-size: 28px; font-weight: 900; color: #2d2640; margin: 0 0 6px;
  }
  .form-subheading { font-size: 14px; color: #aaa; margin: 0; font-weight: 600; }

  .product-form { display: flex; flex-direction: column; gap: 20px; margin-top: 8px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .form-label {
    display: flex; flex-direction: column; gap: 7px;
    font-size: 13px; font-weight: 800; color: #2d2640;
  }
  .required { color: #e87070; }

  .form-input {
    padding: 11px 14px; border-radius: 12px;
    border: 1.5px solid #e8e4f8; background: #faf9fe;
    font-size: 14px; font-weight: 600; color: #2d2640;
    font-family: 'Nunito', sans-serif; transition: all 0.2s; outline: none;
  }
  .form-input:focus { border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
  .form-input::placeholder { color: #ccc; font-weight: 500; }

  .form-select {
    padding: 11px 36px 11px 14px; border-radius: 12px;
    border: 1.5px solid #e8e4f8; background: #faf9fe;
    font-size: 14px; font-weight: 600; color: #2d2640;
    font-family: 'Nunito', sans-serif; transition: all 0.2s; outline: none;
    appearance: none; -webkit-appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b7fd4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .form-select:focus { border-color: #afa7e7; background-color: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }

  .form-textarea {
    padding: 11px 14px; border-radius: 12px;
    border: 1.5px solid #e8e4f8; background: #faf9fe;
    font-size: 14px; font-weight: 600; color: #2d2640;
    font-family: 'Nunito', sans-serif; transition: all 0.2s; outline: none;
    min-height: 100px; resize: vertical;
  }
  .form-textarea:focus { border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
  .form-textarea::placeholder { color: #ccc; font-weight: 500; }

  .file-input-wrap {
    position: relative; display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px; border: 1.5px dashed #e0dbf8;
    background: #faf9fe; cursor: pointer; transition: all 0.2s;
  }
  .file-input-wrap:hover { border-color: #afa7e7; background: #f5f2ff; }
  .file-input-hidden {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .file-input-icon { font-size: 18px; flex-shrink: 0; }
  .file-input-text { font-size: 13px; font-weight: 600; color: #8b7fd4; }

  .form-submit-btn {
    background: linear-gradient(135deg, #C3B1E1, #afa7e7);
    border: none; border-radius: 14px; padding: 14px 0;
    font-size: 15px; font-weight: 800; color: #fff;
    cursor: pointer; font-family: 'Nunito', sans-serif;
    transition: all 0.2s; box-shadow: 0 6px 20px rgba(175,167,231,0.4);
    margin-top: 4px;
  }
  .form-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(175,167,231,0.5); }
  .form-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 600px) {
    .form-card { padding: 24px 18px 24px; }
    .form-row { grid-template-columns: 1fr; gap: 20px; }
    .form-heading { font-size: 24px; }
  }
`;