import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchPremiumStatus, subscribeToPremiumStatus } from "../lib/premiumStatus";
import { PremiumContext } from "./premiumContextValue";

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetchPremiumStatus(user.uid).then((isPremium) => {
      if (!cancelled) setStatus(isPremium ? "premium" : "free");
    });

    const unsub = subscribeToPremiumStatus(user.uid, (isPremium) => {
      if (!cancelled) setStatus(isPremium ? "premium" : "free");
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [user]);

  const refresh = useCallback(() => {
    if (!user) return;
    fetchPremiumStatus(user.uid).then((isPremium) => setStatus(isPremium ? "premium" : "free"));
  }, [user]);

  return (
    <PremiumContext.Provider value={{ status, isPremium: status === "premium", refresh }}>
      {children}
    </PremiumContext.Provider>
  );
}
