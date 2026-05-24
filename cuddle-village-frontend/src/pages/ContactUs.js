import React, { useState } from "react";
import API from "../services/api";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";

function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toasts, toast, dismissToast } = useToast();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/contact", form);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .contact-page {
          font-family:'Nunito',sans-serif;
          background:#faf9fe;
          min-height:100vh;
        }

        .contact-hero {
          background:linear-gradient(135deg,#2d2640,#3d3460);
          padding:60px; color:#fff;
        }
        .contact-hero h1 { font-size:34px; font-weight:900; margin:0 0 8px; }
        .contact-hero p  { color:#bbb; font-size:15px; margin:0; }

        .contact-body { max-width:680px; margin:0 auto; padding:48px 24px; }

        .contact-info-card {
          background:#fff; border-radius:20px; padding:24px 28px;
          box-shadow:0 4px 24px rgba(175,167,231,0.1);
          margin-bottom:20px; border:1.5px solid #f0eeff;
          display:flex; gap:28px; flex-wrap:wrap;
        }
        .contact-info-item { display:flex; align-items:center; gap:10px; }
        .contact-info-icon { font-size:20px; }
        .contact-info-text { font-size:13px; font-weight:700; color:#555; }

        .contact-form-card {
          background:#fff; border-radius:20px; padding:28px 32px;
          box-shadow:0 4px 24px rgba(175,167,231,0.1);
          border:1.5px solid #f0eeff;
        }
        .contact-form-title {
          font-size:16px; font-weight:900; color:#2d2640; margin-bottom:20px;
        }

        .contact-input {
          width:100%; padding:12px 14px; border-radius:12px;
          border:1.5px solid #e8e4f8; background:#f5f3ff;
          margin-bottom:12px; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:600; color:#2d2640;
          box-sizing:border-box; transition:border-color 0.2s;
          outline:none;
        }
        .contact-input:focus { border-color:#afa7e7; background:#fff; }
        textarea.contact-input { min-height:120px; resize:vertical; }

        .contact-btn {
          background:linear-gradient(135deg,#C3B1E1,#afa7e7);
          color:#fff; border:none;
          padding:13px 24px; border-radius:12px;
          font-weight:800; font-size:14px;
          cursor:pointer; font-family:'Nunito',sans-serif;
          transition:opacity 0.2s, transform 0.1s;
          width:100%;
        }
        .contact-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .contact-btn:disabled { opacity:0.6; cursor:not-allowed; }

        @media (max-width:600px) {
          .contact-hero { padding:40px 24px; }
          .contact-body { padding:28px 16px; }
          .contact-form-card { padding:22px 18px; }
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-hero">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you — we're always here to help</p>
        </div>

        <div className="contact-body">
          <div className="contact-info-card">
            <div className="contact-info-item">
              <span className="contact-info-icon">📍</span>
              <span className="contact-info-text">Nairobi, Kenya</span>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">✉️</span>
              <span className="contact-info-text">support@cuddlevillage.com</span>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🕐</span>
              <span className="contact-info-text">Mon–Fri, 8am–6pm EAT</span>
            </div>
          </div>

          <div className="contact-form-card">
            <div className="contact-form-title">Send us a message</div>
            <form onSubmit={handleSubmit}>
              <input
                name="name" className="contact-input" placeholder="Full Name"
                value={form.name} onChange={handleChange} required
              />
              <input
                name="email" className="contact-input" placeholder="Email Address"
                type="email" value={form.email} onChange={handleChange} required
              />
              <input
                name="phone" className="contact-input" placeholder="Phone Number (optional)"
                value={form.phone} onChange={handleChange}
              />
              <textarea
                name="message" className="contact-input" placeholder="Your message…"
                value={form.message} onChange={handleChange} required
              />
              <button className="contact-btn" disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs;
