import React from "react";

const posts = [
  {
    title: "Newborn Essentials: What Every Parent Needs",
    excerpt: "From diapers to feeding bottles, here's the complete list of must-have items for your newborn's first weeks at home.",
    tag: "Newborn", date: "May 10, 2026", emoji: "👶"
  },
  {
    title: "Baby Nutrition: Healthy Feeding Tips for 0–12 Months",
    excerpt: "Expert guidance on breastfeeding, formula, and introducing solids at the right milestones for your baby's development.",
    tag: "Nutrition", date: "Apr 28, 2026", emoji: "🍼"
  },
  {
    title: "How to Build a Safe Sleep Environment for Your Baby",
    excerpt: "Safe sleeping reduces the risk of SIDS. Learn how to set up your baby's cot, choose the right mattress, and create a calming sleep routine.",
    tag: "Safety", date: "Apr 15, 2026", emoji: "😴"
  },
  {
    title: "The Benefits of Early Childhood Reading",
    excerpt: "Starting reading habits before age 3 boosts vocabulary, emotional development, and school readiness. Here's how to make it fun.",
    tag: "Education", date: "Mar 30, 2026", emoji: "📚"
  },
  {
    title: "Choosing the Right Baby Carrier for Your Lifestyle",
    excerpt: "Ring sling, structured carrier, or stretchy wrap? We break down the pros and cons for Nairobi parents on the move.",
    tag: "Products", date: "Mar 14, 2026", emoji: "🤱"
  },
];

const TAG_COLORS = {
  Newborn:   { bg: "#f0edff", color: "#8b7fd4" },
  Nutrition: { bg: "#fff4f0", color: "#e07a5f" },
  Safety:    { bg: "#e8f8f0", color: "#2e8b57" },
  Education: { bg: "#fff8e1", color: "#d4a017" },
  Products:  { bg: "#fce4ec", color: "#c2185b" },
};

function Blog() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .blog-page { font-family:'Nunito',sans-serif; background:#faf9fe; min-height:100vh; }

        .blog-hero {
          background:linear-gradient(135deg,#2d2640,#3d3460);
          padding:60px; color:#fff;
        }
        .blog-hero h1 { font-size:34px; font-weight:900; margin:0 0 8px; }
        .blog-hero p  { color:#bbb; font-size:15px; margin:0; }

        .blog-body { max-width:960px; margin:0 auto; padding:48px 24px; }

        .blog-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:24px;
        }

        .blog-card {
          background:#fff; border-radius:20px; overflow:hidden;
          box-shadow:0 4px 24px rgba(175,167,231,0.1);
          border:1.5px solid #f0eeff;
          display:flex; flex-direction:column;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .blog-card:hover {
          transform:translateY(-4px);
          box-shadow:0 12px 40px rgba(175,167,231,0.18);
        }

        .blog-card-top {
          height:120px;
          background:linear-gradient(135deg,#f0edff,#fdf6ff);
          display:flex; align-items:center; justify-content:center;
          font-size:52px;
        }

        .blog-card-body { padding:20px 22px 22px; flex:1; display:flex; flex-direction:column; }

        .blog-meta {
          display:flex; align-items:center; gap:8px;
          margin-bottom:10px;
        }
        .blog-tag {
          font-size:10px; font-weight:900; letter-spacing:0.5px;
          padding:3px 10px; border-radius:20px;
          text-transform:uppercase;
        }
        .blog-date { font-size:11px; color:#aaa; font-weight:600; }

        .blog-title {
          font-size:15px; font-weight:900; color:#2d2640;
          margin:0 0 8px; line-height:1.4;
        }
        .blog-excerpt {
          font-size:13px; color:#777; font-weight:600;
          line-height:1.65; flex:1; margin-bottom:16px;
        }
        .blog-read-more {
          font-size:13px; font-weight:900; color:#8b7fd4;
          text-decoration:none; align-self:flex-start;
        }
        .blog-read-more:hover { text-decoration:underline; }

        @media (max-width:768px) {
          .blog-hero { padding:40px 24px; }
          .blog-body { padding:32px 16px; }
          .blog-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="blog-page">
        <div className="blog-hero">
          <h1>📖 The Cuddle Village Blog</h1>
          <p>Tips, guides, and stories for every stage of your parenting journey</p>
        </div>

        <div className="blog-body">
          <div className="blog-grid">
            {posts.map((post, i) => {
              const tagStyle = TAG_COLORS[post.tag] || { bg: "#f0edff", color: "#8b7fd4" };
              return (
                <div className="blog-card" key={i}>
                  <div className="blog-card-top">{post.emoji}</div>
                  <div className="blog-card-body">
                    <div className="blog-meta">
                      <span className="blog-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                        {post.tag}
                      </span>
                      <span className="blog-date">{post.date}</span>
                    </div>
                    <div className="blog-title">{post.title}</div>
                    <div className="blog-excerpt">{post.excerpt}</div>
                    <a href="#" className="blog-read-more">Read More →</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;
