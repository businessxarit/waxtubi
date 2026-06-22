import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "waxtubi:theme"; // "auto" | "light" | "dark"

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(preference) {
  const root = document.documentElement;
  if (preference === "auto") {
    root.removeAttribute("data-theme"); // laisse le CSS suivre prefers-color-scheme
  } else {
    root.setAttribute("data-theme", preference);
  }
}

// Abonnement externe au changement de prefers-color-scheme, via
// useSyncExternalStore : pas de setState manuel dans un effet, React
// gère la resynchronisation lui-même quand le système change de thème.
function subscribeToSystemTheme(callback) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * Gère la préférence de thème de l'app : "auto" (suit le système),
 * "light" ou "dark" (override manuel persistant).
 */
export function useTheme() {
  const [preference, setPreference] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "auto"
  );

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "dark" // snapshot serveur — sans incidence ici (app 100% client)
  );

  const resolvedTheme = preference === "auto" ? systemTheme : preference;

  // Synchronise l'attribut DOM + le localStorage avec la préférence —
  // ce sont des effets de bord vers un système externe (DOM, storage),
  // pas un setState React, donc pas de cascade de rendu à éviter ici.
  useEffect(() => {
    applyTheme(preference);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  const setTheme = useCallback((next) => setPreference(next), []);

  return { preference, resolvedTheme, setTheme };
}
