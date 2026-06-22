const BASE = "https://api.aladhan.com/v1";

let namesCache = null;

/**
 * Récupère les 99 Noms d'Allah (arabe, transcription, traduction anglaise).
 * Mis en cache en mémoire car le contenu est statique.
 */
export async function fetchAsmaAlHusna() {
  if (namesCache) return namesCache;
  const res = await fetch(`${BASE}/asmaAlHusna`);
  if (!res.ok) throw new Error("Impossible de récupérer les 99 Noms");
  const json = await res.json();
  namesCache = json.data.map((n) => ({
    number: n.number,
    arabic: n.name,
    transliteration: n.transliteration,
    meaningEn: n.en?.meaning ?? "",
  }));
  return namesCache;
}
