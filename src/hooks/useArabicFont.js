import { useState, useEffect, useCallback } from "react";
import { ARABIC_FONTS, DEFAULT_ARABIC_FONT_ID } from "../lib/arabicFonts";

const STORAGE_KEY = "waxtubi:arabicFont";

export function useArabicFont() {
  const [fontId, setFontId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_ARABIC_FONT_ID
  );

  const current = ARABIC_FONTS.find((f) => f.id === fontId) ?? ARABIC_FONTS[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, fontId);
    document.documentElement.style.setProperty("--font-arabic", current.fontFamily);
  }, [fontId, current.fontFamily]);

  const setFont = useCallback((id) => setFontId(id), []);

  return { fontId, fontFamily: current.fontFamily, setFont, options: ARABIC_FONTS };
}
