import { useContext } from "react";
import { PremiumContext } from "../context/premiumContextValue";

export function usePremium() {
  return useContext(PremiumContext);
}
