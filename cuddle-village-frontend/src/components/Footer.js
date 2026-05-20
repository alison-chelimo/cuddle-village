import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      <style>{`
        .footer {
          background: #2d2640;
          color: #ccc;
          padding: 40px 60px;
          font-family: 'Nunito', sans-serif;
        }

        .footer h5 {
          color: #fff;
          margin-bottom: 10px;
        }

        .footer a {
          color: #bbb;
          text-decoration: none;
          display: block;
          margin-bottom: 6px;
        }

        .footer a:hover {
          color: #afa7e7;
        }

        .footer-bottom {
          margin-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 10px;
          text-align: center;
          font-size: 12px;
        }
      `}</style>

      <div className="footer">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <h5>Cuddle Village</h5>
            <p>Your trusted baby & parenting partner</p>
          </div>

          <div>
            <h5>Quick Links</h5>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/terms">Terms</Link>
          </div>

          <div>
            <h5>Contact</h5>
            <p>Nairobi, Kenya</p>
            <p>support@cuddlevillage.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 The Cuddle Village Inc.
        </div>
      </div>
    </>
  );
}

export default Footer;