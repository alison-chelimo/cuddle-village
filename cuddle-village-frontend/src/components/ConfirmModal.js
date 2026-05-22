import React, { useEffect, useRef } from "react";

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .cm-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: cmFadeIn 0.15s ease;
        }
        @keyframes cmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .cm-modal {
          background: #fff;
          border-radius: 20px;
          padding: 32px 28px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
          font-family: 'Nunito', sans-serif;
          animation: cmSlideUp 0.2s ease;
        }
        @keyframes cmSlideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .cm-title {
          font-size: 18px; font-weight: 900; color: #2d2640;
          margin: 0 0 10px;
        }
        .cm-message {
          font-size: 14px; color: #666; font-weight: 600;
          line-height: 1.6; margin: 0 0 24px;
        }
        .cm-actions {
          display: flex; gap: 10px; justify-content: flex-end;
        }
        .cm-btn {
          padding: 10px 20px; border-radius: 10px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.15s;
          border: none;
        }
        .cm-btn-cancel {
          background: #f5f3ff; color: #8b7fd4;
          border: 1.5px solid #e8e4f8;
        }
        .cm-btn-cancel:hover { background: #ede9f8; }
        .cm-btn-confirm-danger {
          background: #e74c3c; color: #fff;
        }
        .cm-btn-confirm-danger:hover { background: #c0392b; }
        .cm-btn-confirm-safe {
          background: linear-gradient(135deg, #C3B1E1, #afa7e7); color: #fff;
        }
        .cm-btn-confirm-safe:hover { opacity: 0.9; }
      `}</style>

      <div className="cm-backdrop" onClick={onCancel}>
        <div
          className="cm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cm-title"
          onClick={e => e.stopPropagation()}
        >
          <div className="cm-title" id="cm-title">{title}</div>
          {message && <div className="cm-message">{message}</div>}
          <div className="cm-actions">
            <button
              ref={cancelRef}
              className="cm-btn cm-btn-cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              className={`cm-btn ${danger ? "cm-btn-confirm-danger" : "cm-btn-confirm-safe"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
