import { createContext } from "react";

// Statut Premium : "free" | "premium" | "loading"
export const PremiumContext = createContext({
  status: "loading",
  isPremium: false,
  refresh: () => {},
});
