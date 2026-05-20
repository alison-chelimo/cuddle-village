import React from "react";

function AboutUs() {
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
          margin-bottom: 10px;
        }

        .page-subtitle {
          color: #777;
          margin-bottom: 30px;
        }

        .card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 12px 40px rgba(175,167,231,0.15);
          margin-bottom: 20px;
        }

        .mission-vision {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .mv-card {
          border-radius: 20px;
          padding: 24px;
          color: #2d2640;
          font-weight: 600;
        }

        .mission {
          background: linear-gradient(135deg, #f0edff, #e8e4f8);
        }

        .vision {
          background: linear-gradient(135deg, #fff4f0, #fde8de);
        }

        .mv-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .mission-vision {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <h1 className="page-title">About Us</h1>
        <p className="page-subtitle">Your parenting support hub</p>

        <div className="card">
          <p>
            The Cuddle Village Inc. is a premium baby and parenting lifestyle
            brand in Nairobi offering baby products, parenting support, and
            early childhood development resources.
          </p>
        </div>

        {/* ✅ NEW: Mission & Vision Section */}
        <div className="mission-vision">
          <div className="mv-card mission">
            <div className="mv-title">Mission</div>
            <p>
              One-stop village where parents access quality baby products,
              expert guidance, and early childhood development support.
            </p>
          </div>

          <div className="mv-card vision">
            <div className="mv-title">Vision</div>
            <p>
              Most trusted baby & parenting lifestyle brand
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUs;