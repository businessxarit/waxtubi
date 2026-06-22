import { useCallback, useEffect, useState } from "react";

/**
 * Synthèse vocale via l'API native du navigateur (gratuite, aucune clé).
 * Qualité de prononciation arabe variable selon l'appareil — ce n'est
 * pas une récitation traditionnelle, juste une aide à la lecture.
 */
const SPEECH_SUPPORTED = typeof window !== "undefined" && "speechSynthesis" in window;

export function useSpeech() {
  const [hasArabicVoice, setHasArabicVoice] = useState(SPEECH_SUPPORTED ? null : false);

  useEffect(() => {
    if (!SPEECH_SUPPORTED) return;
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setHasArabicVoice(voices.some((v) => v.lang?.toLowerCase().startsWith("ar")));
    };
    checkVoices();
    window.speechSynthesis.addEventListener("voiceschanged", checkVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", checkVoices);
  }, []);

  const speak = useCallback((text, lang = "ar-SA") => {
    if (!SPEECH_SUPPORTED) return;
    window.speechSynthesis.cancel(); // évite l'empilement si on tape vite
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, supported: SPEECH_SUPPORTED, hasArabicVoice };
}
