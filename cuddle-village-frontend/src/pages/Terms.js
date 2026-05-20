import React from "react";

function Terms() {
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
        }
      `}</style>

      <div className="page">
        <h1 className="page-title">Terms & Conditions</h1>

        <div className="card">
          <p>By using this website, you agree to our terms.</p>
          <p>Payments: M-Pesa, cards, bank transfer.</p>
          <p>Returns: within 24 hours.</p>
        </div>
      </div>
    </>
  );
}

export default Terms;