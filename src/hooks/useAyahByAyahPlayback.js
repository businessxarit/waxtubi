import { useState, useRef, useCallback, useEffect } from "react";
import { getAyahAudioUrl } from "../lib/quran";

/**
 * Lecture séquentielle verset par verset, avec suivi du verset en
 * cours pour permettre le surlignage karaoke-style. Chaque verset a
 * son propre fichier audio (CDN islamic.network) : pas d'estimation
 * de timing, l'enchaînement est piloté par l'évènement "ended" de
 * chaque fichier.
 */
export function useAyahByAyahPlayback(ayahs, reciterIdentifier) {
  const [activeIndex, setActiveIndex] = useState(null); // index dans `ayahs`, ou null si arrêté
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const activeIndexRef = useRef(null); // évite les fermetures obsolètes dans les handlers

  // playFromIndexRef permet à audio.onended d'appeler la version la
  // plus récente de playFromIndex sans créer de dépendance circulaire
  // dans useCallback (le handler est assigné après la déclaration).
  const playFromIndexRef = useRef(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Arrête tout si on change de sourate/récitateur
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [reciterIdentifier]);

  const playFromIndex = useCallback(
    (index) => {
      if (!reciterIdentifier || !ayahs || index >= ayahs.length) {
        setActiveIndex(null);
        setIsPlaying(false);
        return;
      }

      audioRef.current?.pause();
      const ayah = ayahs[index];
      const audio = new Audio(getAyahAudioUrl(ayah.globalNumber, reciterIdentifier));
      audioRef.current = audio;

      audio.onended = () => {
        if (activeIndexRef.current === index) {
          playFromIndexRef.current?.(index + 1); // enchaîne automatiquement le verset suivant
        }
      };
      audio.onerror = () => {
        setError(`Lecture impossible pour le verset ${ayah.number}.`);
        setIsPlaying(false);
      };

      audio
        .play()
        .then(() => {
          setActiveIndex(index);
          setIsPlaying(true);
          setError(null);
        })
        .catch(() => setError("Lecture audio impossible pour le moment."));
    },
    [ayahs, reciterIdentifier]
  );

  useEffect(() => {
    playFromIndexRef.current = playFromIndex;
  }, [playFromIndex]);

  const play = useCallback(() => {
    playFromIndex(activeIndex ?? 0);
  }, [playFromIndex, activeIndex]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const playAyah = useCallback(
    (index) => {
      playFromIndex(index);
    },
    [playFromIndex]
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActiveIndex(null);
    setIsPlaying(false);
  }, []);

  return { activeIndex, isPlaying, error, play, pause, playAyah, stop };
}
