import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setForm({
        name: res.data.name || "",
        price: res.data.price || "",
        description: res.data.description || "",
        category: res.data.category || "",
        stock: res.data.stock || "",
        image: res.data.image || "",
      });
    } catch (err) {
      console.error(err);
      setError(true);  
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      if (image) {
        data.append("image", image);
      }

      await API.put(`/products/${id}`, data);

      alert("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setError(true);
      alert("Update failed");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.card}>
          <h2 style={styles.heading}>Loading product...</h2>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={styles.card}>
          <h2 style={{ ...styles.heading, color: "#c0392b" }}>Failed to load product</h2>
          <button
            style={{ ...styles.button, backgroundColor: "#f0edff", color: "#8b7fd4" }}
            onClick={() => navigate("/admin/products")}
          >
            ← Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.card}>
        <h1 style={styles.heading}>Edit Product</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </label>
          <label style={styles.label}>Price
            <input
              style={styles.input}
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
            />
          </label>
          <label style={styles.label}>Category
            <input
              style={styles.input}
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
            />
          </label>
          <label style={styles.label}>Stock
            <input
              style={styles.input}
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
            />
          </label>
          <label style={styles.label}>Description
            <textarea
              style={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </label>
          {/* Existing Image */}
          {form.image && (
            <img
              src={form.image}
              alt="product"
              style={{ width: "120px", marginBottom: "10px", borderRadius: '8px', boxShadow: '0 2px 8px 0 rgba(175,167,231,0.10)' }}
            />
          )}
          <label style={styles.label}>Image
            <input style={styles.input} type="file" onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button style={styles.button} type="submit">Update Product</button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditProduct;

const styles = {
  card: {
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 4px 24px 0 rgba(175,167,231,0.10)',
    padding: '36px 32px 28px 32px',
    maxWidth: '420px',
    margin: '0 auto',
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  heading: {
    fontFamily: 'Nunito, Poppins, sans-serif',
    fontWeight: 900,
    fontSize: '2rem',
    color: '#2d2640',
    marginBottom: '24px',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  label: {
    fontWeight: 700,
    color: '#2d2640',
    fontSize: '1rem',
    marginBottom: '2px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  input: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #eee',
    background: '#faf9fe',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginTop: '2px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #eee',
    background: '#faf9fe',
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '80px',
    marginTop: '2px',
    resize: 'vertical',
  },
  button: {
    backgroundColor: '#A7C7E7',
    color: '#2d2640',
    border: 'none',
    padding: '12px 0',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '1.1rem',
    marginTop: '10px',
    cursor: 'pointer',
    transition: '0.3s',
    boxShadow: '0 2px 8px 0 rgba(175,167,231,0.08)',
  },
};