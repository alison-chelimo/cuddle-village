import { useState, useCallback } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, fading: false }]);

    // Begin fade-out at 4.5s, remove at 5s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
    }, 4500);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
    info:    (msg) => addToast(msg, "info"),
  };

  return { toasts, toast, dismissToast };
}
