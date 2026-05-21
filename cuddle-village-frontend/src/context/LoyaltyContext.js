import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { isAuthenticated } from "../utils/auth";

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) {
  const [loyalty, setLoyalty] = useState({
    points:         0,
    lifetimePoints: 0,
    tier:           "Bronze",
    nextTier:       1000,
  });

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await API.get("/loyalty/balance");
      setLoyalty(res.data);
    } catch {
      // silently fail — loyalty is non-critical
    }
  }, []);

  // Seed from localStorage on mount (instant render, no flash)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      if (stored.loyaltyPoints !== undefined) {
        setLoyalty(prev => ({
          ...prev,
          points:         stored.loyaltyPoints  || 0,
          lifetimePoints: stored.lifetimePoints  || 0,
          tier:           stored.loyaltyTier     || "Bronze",
        }));
      }
    } catch {}
    refresh();
  }, [refresh]);

  return (
    <LoyaltyContext.Provider value={{ ...loyalty, refresh }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  return useContext(LoyaltyContext);
}
