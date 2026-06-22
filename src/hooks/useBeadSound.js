import { useState, useEffect, useCallback } from "react";
import { playBeadClick } from "../lib/beadSound";

const STORAGE_KEY = "waxtubi:dhikr:sound";

const DEFAULT_PREFS = {
  enabled: true,
  variant: "soft", // "soft" | "rich"
  volume: 0.6, // 0 à 1
};

function loadPrefs() {
  if (typeof localStorage === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useBeadSound() {
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const play = useCallback(() => {
    if (!prefs.enabled) return;
    playBeadClick(prefs.variant, prefs.volume);
  }, [prefs]);

  const setEnabled = useCallback((enabled) => setPrefs((p) => ({ ...p, enabled })), []);
  const setVariant = useCallback((variant) => setPrefs((p) => ({ ...p, variant })), []);
  const setVolume = useCallback((volume) => setPrefs((p) => ({ ...p, volume })), []);

  return { prefs, play, setEnabled, setVariant, setVolume };
}
