import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { formStyles } from "./AddProduct";

// Categories matching the frontend products.js catalog exactly
const CATEGORIES = [
  { id: "diaper",   label: "👶 Diapering"        },
  { id: "clothing", label: "👕 Clothing"          },
  { id: "feeding",  label: "🍼 Feeding"           },
  { id: "bath",     label: "🛁 Bath & Skincare"   },
  { id: "travel",   label: "🚼 Travel & Nursery"  },
  { id: "toys",     label: "🧸 Toys"              },
  { id: "books",    label: "📚 Books"             },
  { id: "gifts",    label: "🎁 Gifts"             },
  { id: "health",   label: "🩺 Health & Safety"   },
  { id: "mom",      label: "🤱 Mom & Maternity"   },
];

const BASE_PRODUCTS_BY_CATEGORY = {
  diaper: [
    "Newborn Diapers",
    "Small Diapers",
    "Medium Diapers",
    "Large Diapers",
    "XL Diapers",
    "Training Pants",
    "Baby Wipes (Single Pack)",
    "Baby Wipes (Bulk Pack)",
    "Diaper Rash Cream",
    "Changing Mat",
    "Diaper Bin",
    "Changing Bag",
  ],
  clothing: [
    "Newborn Onesie",
    "Newborn Romper",
    "Newborn Sleep Suit",
    "Mittens & Booties",
    "Newborn Cap",
    "Infant Bodysuit",
    "Infant Dress",
    "Two-Piece Set",
    "Infant Jacket",
    "Infant Sweater",
    "Baby Socks",
    "Swaddle Wrap",
    "Baby Blanket",
  ],
  feeding: [
    "Feeding Bottle (Small)",
    "Feeding Bottle (Medium)",
    "Feeding Bottle (Large)",
    "Manual Breast Pump",
    "Electric Breast Pump",
    "Bottle Sterilizer",
    "Bottle Warmer",
    "Baby Bib",
    "Burp Cloth",
    "Sippy Cup",
    "Baby Spoon & Bowl",
    "High Chair",
  ],
  bath: [
    "Baby Soap",
    "Baby Shampoo",
    "Baby Lotion",
    "Baby Oil",
    "Baby Powder",
    "Baby Towel",
    "Baby Washcloth",
    "Baby Bathtub",
    "Grooming Kit",
  ],
  travel: [
    "Stroller",
    "Car Seat",
    "Baby Carrier",
    "Diaper Bag",
    "Baby Cot / Crib",
    "Crib Mattress",
    "Bedding Set",
    "Mosquito Net",
  ],
  toys: [
    "Rattle",
    "Teething Toy",
    "Activity Mat",
    "Soft Toy",
    "Musical Toy",
    "Educational Toy (0–5 yrs)",
  ],
  books: [
    "Board Book",
    "Sensory Book",
    "Storybook",
    "Picture Book",
    "Early Reader",
    "Flashcards",
    "Alphabet & Number Book",
    "Activity Book",
  ],
  gifts: [
    "Newborn Starter Pack",
    "Baby Shower Gift Hamper",
    "Bath Time Kit",
    "Feeding Kit",
    "Monthly Baby Box",
  ],
  health: [
    "Thermometer",
    "Baby First Aid Kit",
    "Nasal Aspirator",
    "Baby-Safe Detergent",
    "Vitamins & Supplements",
  ],
  mom: [
    "Maternity Wear",
    "Nursing Bra",
    "Breastfeeding Cover",
    "Postnatal Care Kit",
    "Nursing Pillow",
  ],
};

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    baseProduct: "",
    brand: "",
    image: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setForm({
          name:        res.data.name        || "",
          price:       res.data.price       || "",
          description: res.data.description || "",
          category:    res.data.category    || "",
          stock:       res.data.stock       || "",
          baseProduct: res.data.baseProduct || "",
          brand:       res.data.brand       || "",
          image:       res.data.image       || "",
        });
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else { 
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!notFound) return;

    const timeoutId = setTimeout(() => {
      navigate("/admin/products");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [notFound, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form)
        .filter((key) => key !== "image")
        .forEach((key) => data.append(key, form[key]));
      if (image) data.append("image", image);
      await API.put(`/products/${id}`, data);
      alert("Product updated!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      console.error(err.response?.data);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: 60, textAlign: "center", color: "#afa7e7", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        Loading product…
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div style={{ padding: 60, textAlign: "center", color: "#c0392b", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        Failed to load product.
        <br />
        <button style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e8e4f8", background: "#f0edff", color: "#8b7fd4", fontWeight: 800, cursor: "pointer" }}
          onClick={() => navigate("/admin/products")}>← Back to Products</button>
      </div>
    </AdminLayout>
  );

  if (notFound) return (
    <AdminLayout>
      <div style={{ padding: 60, textAlign: "center", color: "#c0392b", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
        This product no longer exists — it may have been deleted.
        <br />
        <button style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e8e4f8", background: "#f0edff", color: "#8b7fd4", fontWeight: 800, cursor: "pointer" }}
          onClick={() => navigate("/admin/products")}>← Back to Products</button>
      </div>
    </AdminLayout>
  );

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
              <div className="form-badge">✏️ Edit Product</div>
              <h1 className="form-heading">Edit Product</h1>
              <p className="form-subheading">Update the product details below</p>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <label className="form-label">
                  Product Name <span className="required">*</span>
                  <input className="form-input" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="form-label">
                  Price (KES) <span className="required">*</span>
                  <input className="form-input" type="number" required min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  Category
                  <select className="form-select" value={form.category}
                    onChange={(e) => {
                      const nextCategory = e.target.value;
                      const allowedBaseProducts = BASE_PRODUCTS_BY_CATEGORY[nextCategory] || [];
                      setForm((prev) => ({
                        ...prev,
                        category: nextCategory,
                        baseProduct: allowedBaseProducts.includes(prev.baseProduct) ? prev.baseProduct : "",
                      }));
                    }}>
                    <option value="" disabled>Select a category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  Stock Quantity
                  <input className="form-input" type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  Base Product <span className="required">*</span>
                  <select className="form-select" required disabled={!form.category} value={form.baseProduct}
                    onChange={(e) => setForm({ ...form, baseProduct: e.target.value })}>
                    <option value="" disabled>{form.category ? "Select a base product…" : "Select a category first"}</option>
                    {(BASE_PRODUCTS_BY_CATEGORY[form.category] || []).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  Brand <span className="required">*</span>
                  <input className="form-input" required placeholder="e.g. Pampers, Huggies, NIPNAP" value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </label>
              </div>

              <label className="form-label">
                Description
                <textarea className="form-textarea" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>

              {form.image && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Current Image
                  </p>
                  <img src={form.image} alt="product" style={{
                    width: 100, height: 100, objectFit: "cover",
                    borderRadius: 12, border: "1.5px solid #f0edff",
                  }} />
                </div>
              )}

              <label className="form-label">
                {form.image ? "Replace Image" : "Product Image"}
                <div className="file-input-wrap">
                  <span className="file-input-icon">🖼️</span>
                  <span className="file-input-text">{image ? image.name : "Click to upload new image"}</span>
                  <input type="file" accept="image/*" className="file-input-hidden"
                    onChange={(e) => setImage(e.target.files[0])} />
                </div>
              </label>

              <button className="form-submit-btn" type="submit" disabled={saving}>
                {saving ? "Saving…" : "✅ Update Product"}
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default EditProduct;