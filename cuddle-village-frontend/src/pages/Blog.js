import React from "react";

function Blog() {
  const posts = [
    { title: "Newborn Essentials", desc: "What every parent needs" },
    { title: "Baby Nutrition", desc: "Healthy feeding tips" }
  ];

  return (
    <>
      <style>{`
        .page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
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
          padding: 24px;
          box-shadow: 0 12px 40px rgba(175,167,231,0.15);
          margin-bottom: 15px;
        }
      `}</style>

      <div className="page">
        <h1 className="page-title">Blog</h1>

        {posts.map((p, i) => (
          <div className="card" key={i}>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Blog;