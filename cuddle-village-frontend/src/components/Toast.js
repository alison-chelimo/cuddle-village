import React from "react";

const COLORS = {
  success: { bg: "#f0fdf4", border: "#86efac", text: "#166534", icon: "✅" },
  error:   { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "❌" },
};

export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        .toast-portal {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .toast-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          max-width: 340px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          animation: toastIn 0.3s ease forwards;
          pointer-events: all;
        }
        .toast-item.fading {
          animation: toastOut 0.5s ease forwards;
        }
        .toast-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .toast-msg  { line-height: 1.4; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(40px); }
        }

        @media (max-width: 480px) {
          .toast-portal { right: 12px; left: 12px; top: 12px; }
          .toast-item { max-width: 100%; }
        }
      `}</style>

      <div className="toast-portal">
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.success;
          return (
            <div
              key={t.id}
              className={`toast-item${t.fading ? " fading" : ""}`}
              style={{ background: c.bg, borderColor: c.border, color: c.text }}
            >
              <span className="toast-icon">{c.icon}</span>
              <span className="toast-msg">{t.message}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
