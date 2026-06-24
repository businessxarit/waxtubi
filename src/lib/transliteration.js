// Translittération arabe → latin simplifiée, lettre par lettre.
//
// Important : c'est une approximation phonétique basique, PAS une
// translittération savante (qui demanderait de gérer les voyelles
// courtes, les règles de tajwid, l'assimilation, etc.). Elle sert
// uniquement de repère de lecture pour quelqu'un qui débute, pas
// comme référence académique. Aucune transcription n'est copiée
// d'une source existante : c'est un mapping caractère→son écrit
// directement pour Waxtubi.
const LETTER_MAP = {
  "ا": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h",
  "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s",
  "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "'",
  "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m",
  "ن": "n", "ه": "h", "و": "w", "ي": "y", "ء": "'", "ة": "h",
  "ى": "a", "ؤ": "w", "ئ": "y",
  // Voyelles courtes (diacritiques)
  "َ": "a", "ُ": "u", "ِ": "i", "ْ": "", "ّ": "",
  "ً": "an", "ٌ": "un", "ٍ": "in", "ٰ": "a",
};

/**
 * Translittère un texte arabe en latin, lettre par lettre. Approximatif
 * par nature — sert de repère de lecture, pas de référence savante.
 */
export function transliterateArabic(text) {
  if (!text) return "";
  let result = "";
  for (const char of text) {
    if (char === " ") {
      result += " ";
    } else if (LETTER_MAP[char] !== undefined) {
      result += LETTER_MAP[char];
    }
    // Les caractères non reconnus (ponctuation, chiffres arabes des
    // numéros de verset, etc.) sont simplement ignorés.
  }
  // Nettoyage : espaces multiples, capitalisation de la première lettre
  return result.replace(/\s+/g, " ").trim();
}
