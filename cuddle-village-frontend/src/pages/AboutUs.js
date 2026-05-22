import React from "react";

const values = [
  { emoji: "⭐", title: "Quality First", desc: "Every product is carefully vetted to meet the highest safety and quality standards for your little one." },
  { emoji: "🤝", title: "Community", desc: "We're more than a shop — we're a village of parents, experts, and caregivers supporting each other." },
  { emoji: "💜", title: "Trust", desc: "Transparent pricing, honest reviews, and a no-hassle returns policy — because you deserve to shop with confidence." },
];

function AboutUs() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .about-page { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; }

        .about-hero {
          background:linear-gradient(135deg,#2d2640,#3d3460);
          padding:60px; color:#fff;
        }
        .about-hero h1 { font-size:34px; font-weight:900; margin:0 0 8px; }
        .about-hero p  { color:#bbb; font-size:15px; margin:0; }

        .about-body { max-width:900px; margin:0 auto; padding:48px 24px; }

        .about-card {
          background:#fff; border-radius:20px; padding:28px;
          box-shadow:0 4px 24px rgba(175,167,231,0.1);
          margin-bottom:28px; font-size:15px; color:#444;
          line-height:1.8; font-weight:600;
        }

        .about-section-title {
          font-size:12px; font-weight:900; letter-spacing:1.5px;
          text-transform:uppercase; color:#c3b1e1;
          margin-bottom:16px;
        }

        .about-mv-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:20px; margin-bottom:28px;
        }
        .about-mv-card {
          border-radius:20px; padding:24px;
          color:#2d2640; font-weight:600;
        }
        .about-mv-mission { background:linear-gradient(135deg,#f0edff,#e8e4f8); }
        .about-mv-vision  { background:linear-gradient(135deg,#fff4f0,#fde8de); }
        .about-mv-title   { font-size:18px; font-weight:900; margin-bottom:8px; }

        .about-values-grid {
          display:grid; grid-template-columns:1fr 1fr 1fr;
          gap:20px; margin-bottom:12px;
        }
        .about-value-item {
          background:#fff; border-radius:20px; padding:24px;
          text-align:center; box-shadow:0 4px 24px rgba(175,167,231,0.08);
          border:1.5px solid #f0eeff;
        }
        .about-value-emoji { font-size:36px; margin-bottom:12px; }
        .about-value-title { font-size:15px; font-weight:900; color:#2d2640; margin-bottom:8px; }
        .about-value-desc  { font-size:13px; color:#777; font-weight:600; line-height:1.6; }

        @media (max-width:768px) {
          .about-hero { padding:40px 24px; }
          .about-body { padding:32px 16px; }
          .about-mv-grid { grid-template-columns:1fr; }
          .about-values-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="about-page">
        <div className="about-hero">
          <h1>About The Cuddle Village</h1>
          <p>Your trusted parenting support hub in Nairobi</p>
        </div>

        <div className="about-body">
          <div className="about-section-title">Our Story</div>
          <div className="about-card">
            The Cuddle Village Inc. is a premium baby and parenting lifestyle brand based in Nairobi, Kenya.
            We exist to be the one-stop village where parents can access quality baby products, expert
            parenting guidance, and early childhood development resources — all in one place. From newborn
            essentials to toddler toys, and from book clubs to nutrition advice, we're here every step of
            the journey.
          </div>

          <div className="about-section-title">Mission &amp; Vision</div>
          <div className="about-mv-grid">
            <div className="about-mv-card about-mv-mission">
              <div className="about-mv-title">🎯 Mission</div>
              <p>
                To be the one-stop village where parents access quality baby products,
                expert guidance, and early childhood development support.
              </p>
            </div>
            <div className="about-mv-card about-mv-vision">
              <div className="about-mv-title">🌟 Vision</div>
              <p>
                To become the most trusted baby and parenting lifestyle brand across East Africa,
                empowering families to raise confident, healthy, and happy children.
              </p>
            </div>
          </div>

          <div className="about-section-title">Our Values</div>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <div className="about-value-item" key={i}>
                <div className="about-value-emoji">{v.emoji}</div>
                <div className="about-value-title">{v.title}</div>
                <div className="about-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
