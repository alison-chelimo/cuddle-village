import React, { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, Visa/Mastercard, bank transfer, and cash on delivery for orders within Nairobi."
  },
  {
    q: "Where do you deliver and how long does it take?",
    a: "We deliver across Kenya. Nairobi orders typically arrive within 1–2 business days. Other regions take 3–5 business days."
  },
  {
    q: "What is your return and exchange policy?",
    a: "Returns are accepted within 24 hours of delivery for unused, undamaged items in original packaging. Contact us to initiate a return."
  },
  {
    q: "How does the loyalty programme work?",
    a: "You earn 1 loyalty point per KES 100 spent. Points accumulate toward Bronze, Silver, Gold, and Platinum tiers and can be redeemed at checkout for discounts."
  },
  {
    q: "Who can join the Book Club?",
    a: "The Book Club is open to children aged 4–8. Early Learners (4–5 years) and Growing Readers (6–8 years) have separate, age-appropriate programmes."
  },
  {
    q: "How do I know your products are safe for babies?",
    a: "All products in our catalogue are vetted for baby safety. We stock only trusted brands and review certifications before listing any item."
  },
  {
    q: "Can I include a gift note with my order?",
    a: "Yes! Add your gift message in the order notes field during checkout and we'll include a handwritten note with your package at no extra charge."
  },
  {
    q: "I have a question not listed here — how do I reach you?",
    a: "Reach us at support@cuddlevillage.com or fill in the contact form on our Contact page. We respond within 24 hours on business days."
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .faq-page { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; }

        .faq-hero {
          background:linear-gradient(135deg,#2d2640,#3d3460);
          padding:60px; text-align:center; color:#fff;
        }
        .faq-hero-icon { font-size:52px; margin-bottom:16px; }
        .faq-hero h1 { font-size:32px; font-weight:900; margin:0 0 8px; }
        .faq-hero p  { color:#bbb; font-size:15px; margin:0; }

        .faq-body { max-width:720px; margin:0 auto; padding:48px 24px; }

        .faq-item {
          border-radius:14px; overflow:hidden;
          margin-bottom:10px; border:1.5px solid #ede9f8;
        }
        .faq-question {
          width:100%; text-align:left; background:#fff;
          padding:18px 20px; border:none; cursor:pointer;
          display:flex; justify-content:space-between; align-items:center;
          font-size:15px; font-weight:800; color:#2d2640;
          font-family:'Nunito',sans-serif; transition:background 0.15s;
        }
        .faq-question:hover { background:#faf9fe; }
        .faq-question.open  { background:#f0edff; color:#6b5fc7; }
        .faq-arrow {
          font-size:13px; transition:transform 0.2s;
          flex-shrink:0; margin-left:12px;
        }
        .faq-arrow.open { transform:rotate(180deg); }
        .faq-answer {
          padding:0 20px; max-height:0; overflow:hidden;
          transition:max-height 0.3s ease, padding 0.3s;
          background:#fff; font-size:14px; color:#555;
          line-height:1.75; font-weight:600;
        }
        .faq-answer.open { max-height:250px; padding:0 20px 18px; }

        .faq-cta {
          margin-top:40px; text-align:center; padding:28px;
          background:#f0edff; border-radius:20px;
          font-weight:800; color:#2d2640;
        }
        .faq-cta a {
          color:#8b7fd4; text-decoration:none; font-weight:900;
        }
        .faq-cta a:hover { text-decoration:underline; }

        @media (max-width:600px) {
          .faq-hero { padding:40px 24px; }
          .faq-hero h1 { font-size:24px; }
          .faq-body { padding:28px 16px; }
        }
      `}</style>

      <div className="faq-page">
        <div className="faq-hero">
          <div className="faq-hero-icon">❓</div>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about The Cuddle Village</p>
        </div>

        <div className="faq-body">
          {faqs.map((faq, i) => (
            <div className="faq-item" key={i}>
              <button
                className={`faq-question${openIdx === i ? " open" : ""}`}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                {faq.q}
                <span className={`faq-arrow${openIdx === i ? " open" : ""}`}>▼</span>
              </button>
              <div className={`faq-answer${openIdx === i ? " open" : ""}`}>
                {faq.a}
              </div>
            </div>
          ))}

          <div className="faq-cta">
            Still have questions?{" "}
            <Link to="/contact-us">Contact our support team →</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQ;
