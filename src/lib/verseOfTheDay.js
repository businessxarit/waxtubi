// Verset du jour — sélection déterministe par date (même verset toute
// la journée, change le lendemain), parmi un pool de références vers
// des versets courts et largement connus. Le texte réel (arabe +
// traduction) est récupéré en direct via l'API alquran.cloud — rien
// n'est codé en dur ici à part les références (sourate:verset).
const VERSE_POOL = [
  { surah: 2, ayah: 152 },
  { surah: 2, ayah: 286 },
  { surah: 3, ayah: 159 },
  { surah: 13, ayah: 28 },
  { surah: 16, ayah: 128 },
  { surah: 17, ayah: 23 },
  { surah: 25, ayah: 70 },
  { surah: 39, ayah: 53 },
  { surah: 65, ayah: 3 },
  { surah: 94, ayah: 5 },
  { surah: 94, ayah: 6 },
  { surah: 103, ayah: 1 },
  { surah: 103, ayah: 2 },
  { surah: 103, ayah: 3 },
];

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // "2026-06-24"
}

/**
 * Sélectionne une référence de verset stable pour aujourd'hui — un
 * simple hash de la date pour choisir un index dans le pool.
 */
export function getTodaysVerseRef() {
  const key = dayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERSE_POOL.length;
  return VERSE_POOL[index];
}

import { resolveTranslationEdition } from "./quran";

const BASE = "https://api.alquran.cloud/v1";

/**
 * Récupère le texte arabe + traduction du verset du jour, pour une
 * langue donnée. Réutilise la résolution dynamique d'édition (pas
 * d'identifiant codé en dur) déjà en place pour le reste du Coran.
 */
export async function fetchTodaysVerse(langCode) {
  const ref = getTodaysVerseRef();
  const translationEdition = await resolveTranslationEdition(langCode);

  const globalRes = await fetch(`${BASE}/surah/${ref.surah}/quran-uthmani`);
  if (!globalRes.ok) throw new Error("Verset du jour indisponible");
  const globalJson = await globalRes.json();
  const arabicAyah = globalJson.data.ayahs.find((a) => a.numberInSurah === ref.ayah);

  const translationRes = await fetch(`${BASE}/ayah/${arabicAyah.number}/${translationEdition}`);
  if (!translationRes.ok) throw new Error("Traduction du verset du jour indisponible");
  const translationJson = await translationRes.json();

  return {
    surahNumber: ref.surah,
    surahName: globalJson.data.englishName,
    ayahNumber: ref.ayah,
    arabic: arabicAyah.text,
    translation: translationJson.data.text,
  };
}
