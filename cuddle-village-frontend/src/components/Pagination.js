import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <>
      <style>{`
        .pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 20px;
          font-family: 'Nunito', sans-serif;
        }
        .pg-btn {
          min-width: 36px; height: 36px; border-radius: 10px;
          border: 1.5px solid #e8e4f8; background: #fff;
          font-size: 13px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; color: #8b7fd4;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center;
          padding: 0 10px;
        }
        .pg-btn:hover:not(:disabled) { background: #f0eeff; border-color: #afa7e7; }
        .pg-btn.active { background: linear-gradient(135deg,#7c5cbf,#6040a8); color: #fff; border-color: transparent; }
        .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pg-ellipsis { font-size: 13px; color: #bbb; font-weight: 700; padding: 0 4px; }
      `}</style>
      <div className="pagination">
        <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="pg-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pg-btn${page === p ? " active" : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button className="pg-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          Next →
        </button>
      </div>
    </>
  );
}
