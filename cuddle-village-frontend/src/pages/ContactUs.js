import React, { useState } from "react";
import API from "../services/api";

function ContactUs() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/contact", form);
    alert("Message sent!");
  };

  return (
    <>
      <style>{`
        .page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          padding: 60px;
        }

        .page-title {
          font-size: 34px;
          font-weight: 900;
          color: #2d2640;
          margin-bottom: 20px;
        }

        .card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 12px 40px rgba(175,167,231,0.15);
          margin-bottom: 20px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1.5px solid #e8e4f8;
          background: #f5f3ff;
          margin-bottom: 12px;
          font-family: 'Nunito';
        }

        .btn {
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="page">
        <h1 className="page-title">Contact Us</h1>

        <div className="card">
          <p>Nairobi, Kenya</p>
          <p>support@cuddlevillage.com</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <input name="name" className="input" placeholder="Full Name" onChange={handleChange} required />
            <input name="email" className="input" placeholder="Email" onChange={handleChange} required />
            <input name="phone" className="input" placeholder="Phone" onChange={handleChange} />
            <textarea name="message" className="input" placeholder="Message" onChange={handleChange} required />
            <button className="btn">Send Message</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ContactUs;