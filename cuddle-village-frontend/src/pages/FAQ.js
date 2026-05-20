import React from "react";

function FAQ() {
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
        <h1 className="page-title">FAQ</h1>

        <div className="card">
          <h4>Payment methods?</h4>
          <p>M-Pesa, cards, bank transfer, cash on delivery</p>
        </div>

        <div className="card">
          <h4>Delivery?</h4>
          <p>We deliver across Kenya</p>
        </div>

        <div className="card">
          <h4>Returns?</h4>
          <p>Within 24 hours, unused items</p>
        </div>
      </div>
    </>
  );
}

export default FAQ;