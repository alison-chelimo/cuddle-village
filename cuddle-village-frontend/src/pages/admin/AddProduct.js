import React, { useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    if (image) data.append("image", image);

    await API.post("/products", data);

    alert("Product added");
  };

  return (
    <AdminLayout>
      <div style={styles.card}>
        <h1 style={styles.heading}>Add Product</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name
            <input style={styles.input} placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label style={styles.label}>Price
            <input style={styles.input} placeholder="Price" onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label style={styles.label}>Category
            <input style={styles.input} placeholder="Category" onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label style={styles.label}>Stock
            <input style={styles.input} placeholder="Stock" onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </label>
          <label style={styles.label}>Description
            <textarea style={styles.textarea} placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label style={styles.label}>Image
            <input style={styles.input} type="file" onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button style={styles.button}>Add Product</button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddProduct;

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