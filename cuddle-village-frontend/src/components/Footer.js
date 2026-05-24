import React, { useState } from "react";
import { Link } from "react-router-dom";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .ft-footer {
          background: #2d2640;
          font-family: 'Nunito', sans-serif;
          color: #ccc;
        }

        .ft-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 48px;
          padding: 56px 60px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ft-brand-name {
          font-size: 18px; font-weight: 900; color: #fff;
          margin: 0 0 6px;
        }
        .ft-brand-tagline {
          font-size: 13px; color: #bbb; font-weight: 600;
          margin: 0 0 18px; line-height: 1.5;
        }
        .ft-socials { display: flex; gap: 8px; }
        .ft-social-btn {
          display: inline-flex; width: 36px; height: 36px;
          background: rgba(255,255,255,0.08); border-radius: 10px;
          align-items: center; justify-content: center;
          color: #ccc; text-decoration: none; font-size: 16px;
          transition: background 0.2s, color 0.2s;
          border: none; cursor: pointer; padding: 0;
        }
        .ft-social-btn:hover { background: rgba(175,167,231,0.25); color: #C3B1E1; }

        .ft-col-title {
          font-size: 11px; font-weight: 900; letter-spacing: 1px;
          text-transform: uppercase; color: #fff;
          margin: 0 0 14px;
        }
        .ft-col a {
          display: block; font-size: 13px; font-weight: 600;
          color: #bbb; text-decoration: none; margin-bottom: 8px;
          transition: color 0.15s;
        }
        .ft-col a:hover { color: #afa7e7; }
        .ft-col p { font-size: 13px; font-weight: 600; color: #bbb; margin: 0 0 8px; }

        .ft-newsletter {
          padding: 28px 60px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-wrap: wrap;
        }
        .ft-newsletter-text h4 {
          font-size: 15px; font-weight: 900; color: #fff; margin: 0 0 4px;
        }
        .ft-newsletter-text p {
          font-size: 12px; color: #bbb; font-weight: 600; margin: 0;
        }
        .ft-newsletter-form {
          display: flex; gap: 8px; flex: 1; max-width: 380px;
        }
        .ft-newsletter-input {
          flex: 1; padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.07); color: #fff;
          font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600;
          outline: none; transition: border-color 0.2s;
        }
        .ft-newsletter-input::placeholder { color: rgba(255,255,255,0.35); }
        .ft-newsletter-input:focus { border-color: rgba(175,167,231,0.5); }
        .ft-newsletter-btn {
          padding: 10px 18px; background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .ft-newsletter-btn:hover { opacity: 0.9; }
        .ft-subscribed {
          font-size: 13px; font-weight: 800; color: #B5D99C;
          padding: 10px 0;
        }

        .ft-bottom {
          padding: 18px 60px;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 10px;
          font-size: 12px; color: #777;
        }
        .ft-bottom-links { display: flex; gap: 16px; }
        .ft-bottom-links a { color: #777; text-decoration: none; font-weight: 600; transition: color 0.15s; }
        .ft-bottom-links a:hover { color: #afa7e7; }

        @media (max-width:900px) {
          .ft-top {
            grid-template-columns: 1fr 1fr;
            padding: 40px 24px 32px;
            gap: 32px;
          }
          .ft-newsletter { padding: 24px; flex-direction: column; align-items: flex-start; }
          .ft-newsletter-form { max-width: 100%; width: 100%; }
          .ft-bottom { padding: 16px 24px; }
        }
        @media (max-width:480px) {
          .ft-top { grid-template-columns: 1fr; padding: 32px 20px; gap: 28px; }
        }
      `}</style>

      <footer className="ft-footer">
        <div className="ft-top">
          {/* Brand */}
          <div>
            <div className="ft-brand-name">🧸 The Cuddle Village</div>
            <p className="ft-brand-tagline">
              Your trusted baby &amp; parenting lifestyle partner in Nairobi, Kenya.
            </p>
            <div className="ft-socials">
              <button className="ft-social-btn" title="Instagram">📸</button>
              <button className="ft-social-btn" title="Facebook">👥</button>
              <button className="ft-social-btn" title="Twitter / X">🐦</button>
            </div>
          </div>

          {/* Shop */}
          <div className="ft-col">
            <div className="ft-col-title">Shop</div>
            <Link to="/products">All Products</Link>
            <Link to="/book-club">Book Club</Link>
            <Link to="/blog">Parenting Blog</Link>
            <Link to="/orders">My Orders</Link>
          </div>

          {/* Company */}
          <div className="ft-col">
            <div className="ft-col-title">Company</div>
            <Link to="/about">About Us</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/blog">Blog</Link>
          </div>

          {/* Help */}
          <div className="ft-col">
            <div className="ft-col-title">Help</div>
            <Link to="/contact-us">Contact Us</Link>
            <p>📍 Nairobi, Kenya</p>
            <p>✉️ support@cuddlevillage.com</p>
            <p>🕐 Mon–Fri, 8am–6pm EAT</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="ft-newsletter">
          <div className="ft-newsletter-text">
            <h4>Stay in the loop</h4>
            <p>Get parenting tips, new arrivals, and exclusive offers.</p>
          </div>
          {subscribed ? (
            <div className="ft-subscribed">✅ You're on the list! Thanks for subscribing.</div>
          ) : (
            <form className="ft-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="ft-newsletter-input"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="ft-newsletter-btn">Subscribe</button>
            </form>
          )}
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} The Cuddle Village Inc. All rights reserved.</span>
          <div className="ft-bottom-links">
            <Link to="/terms">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
