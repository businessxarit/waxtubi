const BASE = "https://api.alquran.cloud/v1";

// Édition du texte arabe original (Uthmani, la plus répandue à l'écrit)
const ARABIC_EDITION = "quran-uthmani";

// Langues de traduction proposées dans le sélecteur de l'app.
// On ne code pas l'identifiant d'édition en dur : on le résout
// dynamiquement via /edition/language/{code}, car alquran.cloud
// peut avoir plusieurs éditions par langue et changer l'édition
// "par défaut" suggérée au fil du temps.
export const TRANSLATION_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

let surahListCache = null;
const editionCache = {}; // { fr: "fr.hamidullah", en: "en.sahih", ... }
let audioEditionsCache = null;

/**
 * Récitateurs connus qu'on cherche à faire correspondre dans la liste
 * réelle des éditions audio renvoyée par l'API (jamais d'identifiant
 * codé en dur : on matche par mot-clé sur le nom anglais retourné).
 * Si un récitateur n'est pas trouvé dans le catalogue actuel de
 * l'API, il est simplement absent du sélecteur — pas d'erreur, pas
 * d'identifiant inventé.
 */
const KNOWN_RECITERS = [
  { key: "alafasy", label: "Mishary Alafasy", match: ["alafasy"] },
  { key: "sudais", label: "Abdul Rahman Al-Sudais", match: ["sudais"] },
  { key: "shuraim", label: "Saud Al-Shuraim", match: ["shuraim", "shuraym", "alshuraim"] },
  { key: "husary", label: "Mahmoud Al-Husary", match: ["husary", "husari"] },
  { key: "minshawi", label: "Mohamed Al-Minshawi", match: ["minshawi", "menshawi"] },
  { key: "ghamdi", label: "Saad Al-Ghamdi", match: ["ghamdi"] },
  { key: "ajamy", label: "Ahmad Al-Ajmi", match: ["ajmy", "ajami", "ajmi"] },
  { key: "shatri", label: "Abu Bakr Al-Shatri", match: ["shaatree", "shatri", "shatree"] },
  { key: "basit", label: "Abdul Basit", match: ["abdulbasit", "abdulbasitmurattal"] },
  { key: "jaber", label: "Ali Jaber", match: ["jaber", "jabir", "jabr"] },
  { key: "mohaysani", label: "Rayan Al-Mohaysani", match: ["mohaysani", "muhaysini", "muhaisni", "mohaisani", "rayan"] },
];

/**
 * Récupère et met en cache la liste réelle des éditions audio arabes
 * disponibles sur alquran.cloud, fait correspondre les récitateurs
 * connus à ce catalogue, PUIS vérifie que le fichier audio existe
 * réellement sur le CDN (cdn.islamic.network) pour la sourate Al-Fatiha
 * avec cet identifiant — les deux catalogues (API texte/métadonnées vs
 * CDN audio) ne partagent pas forcément les mêmes identifiants, donc un
 * récitateur "trouvé" côté API peut tout de même n'avoir aucun fichier
 * audio correspondant. Les récitateurs sans fichier vérifié sont
 * silencieusement retirés du sélecteur plutôt que de planter à l'usage.
 */
export async function fetchAvailableReciters() {
  if (audioEditionsCache) return audioEditionsCache;

  const res = await fetch(`${BASE}/edition?format=audio&language=ar`);
  if (!res.ok) throw new Error("Impossible de récupérer la liste des récitateurs");
  const json = await res.json();
  const editions = json.data || [];

  const candidates = [];
  for (const reciter of KNOWN_RECITERS) {
    const found = editions.find((e) =>
      reciter.match.some((kw) => e.identifier.toLowerCase().includes(kw) || e.englishName.toLowerCase().includes(kw))
    );
    if (found) {
      candidates.push({ key: reciter.key, label: reciter.label, identifier: found.identifier });
    }
  }

  // Vérifie en parallèle que chaque candidat a bien un fichier audio
  // pour Al-Fatiha (sourate 1) sur le CDN — test rapide et léger (HEAD)
  // plutôt que de télécharger le fichier entier.
  const checked = await Promise.all(
    candidates.map(async (c) => {
      try {
        const checkRes = await fetch(getSurahAudioUrl(1, c.identifier), { method: "HEAD" });
        return checkRes.ok ? c : null;
      } catch {
        return null;
      }
    })
  );
  const matched = checked.filter(Boolean);

  // Toujours garder Alafasy en secours en tête de liste si rien d'autre n'est trouvé
  audioEditionsCache = matched.length > 0 ? matched : [{ key: "alafasy", label: "Mishary Alafasy", identifier: "ar.alafasy" }];
  return audioEditionsCache;
}

/**
 * Recherche un mot-clé dans tout le Coran, pour une langue donnée
 * (traduction résolue dynamiquement comme pour la lecture normale).
 * Retourne les versets correspondants avec leur sourate d'origine.
 */
export async function searchQuran(keyword, langCode) {
  if (!keyword || keyword.trim().length < 2) return [];
  const translationEdition = await resolveTranslationEdition(langCode);
  const res = await fetch(
    `${BASE}/search/${encodeURIComponent(keyword.trim())}/all/${translationEdition}`
  );
  if (!res.ok) {
    if (res.status === 404) return []; // aucun résultat, pas une erreur
    throw new Error("Recherche indisponible pour le moment");
  }
  const json = await res.json();
  const matches = json.data?.matches ?? [];
  return matches.map((m) => ({
    surahNumber: m.surah.number,
    surahName: m.surah.englishName,
    ayahNumber: m.numberInSurah,
    globalNumber: m.number,
    text: m.text,
  }));
}

/**
 * Construit l'URL de streaming pour une sourate donnée et un récitateur.
 * Utilise le CDN officiel islamic.network, bitrate 128kbps (bon compromis qualité/poids).
 */
export function getSurahAudioUrl(surahNumber, reciterIdentifier) {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterIdentifier}/${surahNumber}.mp3`;
}

/**
 * Construit l'URL de streaming pour UN SEUL verset (numéro global 1-6236),
 * utilisée pour la lecture séquentielle synchronisée avec le surlignage
 * du verset en cours (mode "karaoke").
 */
export function getAyahAudioUrl(globalAyahNumber, reciterIdentifier) {
  return `https://cdn.islamic.network/quran/audio/128/${reciterIdentifier}/${globalAyahNumber}.mp3`;
}

/**
 * Résout l'identifiant d'édition "translation" à utiliser pour une langue donnée.
 * Préfère une édition de type "translation" ; à défaut, prend la première dispo.
 */
export async function resolveTranslationEdition(langCode) {
  if (editionCache[langCode]) return editionCache[langCode];

  const res = await fetch(`${BASE}/edition/language/${langCode}`);
  if (!res.ok) throw new Error(`Aucune traduction disponible pour la langue "${langCode}"`);
  const json = await res.json();
  const editions = json.data || [];

  const translation =
    editions.find((e) => e.type === "translation") ?? editions[0];

  if (!translation) {
    throw new Error(`Aucune traduction disponible pour la langue "${langCode}"`);
  }

  editionCache[langCode] = translation.identifier;
  return translation.identifier;
}

/**
 * Liste des 114 sourates (numéro, nom arabe, nom transcrit, traduction, nb versets).
 */
export async function fetchSurahList() {
  if (surahListCache) return surahListCache;
  const res = await fetch(`${BASE}/surah`);
  if (!res.ok) throw new Error("Impossible de récupérer la liste des sourates");
  const json = await res.json();
  surahListCache = json.data.map((s) => ({
    number: s.number,
    name: s.name, // nom arabe
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
  return surahListCache;
}

/**
 * Récupère une sourate complète : texte arabe + traduction choisie,
 * versets alignés côte à côte.
 * @param {number} surahNumber
 * @param {string} langCode - "fr" ou "en"
 */
export async function fetchSurah(surahNumber, langCode) {
  const translationEdition = await resolveTranslationEdition(langCode);

  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE}/surah/${surahNumber}/${ARABIC_EDITION}`),
    fetch(`${BASE}/surah/${surahNumber}/${translationEdition}`),
  ]);

  if (!arabicRes.ok || !translationRes.ok) {
    throw new Error("Impossible de récupérer cette sourate");
  }

  const arabicJson = await arabicRes.json();
  const translationJson = await translationRes.json();

  const arabicAyahs = arabicJson.data.ayahs;
  const translationAyahs = translationJson.data.ayahs;

  const ayahs = arabicAyahs.map((a, i) => ({
    number: a.numberInSurah,
    globalNumber: a.number,
    arabic: a.text,
    translation: translationAyahs[i]?.text ?? "",
  }));

  return {
    number: arabicJson.data.number,
    name: arabicJson.data.name,
    englishName: arabicJson.data.englishName,
    englishNameTranslation: arabicJson.data.englishNameTranslation,
    revelationType: arabicJson.data.revelationType,
    translationEdition,
    ayahs,
  };
}
