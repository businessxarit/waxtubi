// Styles d'écriture arabe disponibles dans Waxtubi.
// Toutes gratuites via Google Fonts, chargées dans index.html.
//
// Note honnête : "Amiri" est une police calligraphique moderne inspirée
// des manuscrits classiques (style proche du Naskh ancien utilisé pour
// le Coran), mais ce n'est pas la police Uthmani officielle propriétaire
// (KFGQPC) utilisée dans les imprimés du Coran — on ne prétend pas
// proposer "le vrai Uthmani", juste un style qui s'en approche visuellement.
export const ARABIC_FONTS = [
  {
    id: "amiri",
    label: "Manuscrit",
    sublabel: "Amiri — style calligraphique classique",
    fontFamily: "'Amiri', serif",
  },
  {
    id: "naskh",
    label: "Naskh",
    sublabel: "Noto Naskh Arabic — lisible, traditionnel",
    fontFamily: "'Noto Naskh Arabic', serif",
  },
  {
    id: "kufi",
    label: "Kufi",
    sublabel: "Noto Kufi Arabic — géométrique, ancien",
    fontFamily: "'Noto Kufi Arabic', sans-serif",
  },
  {
    id: "moderne",
    label: "Moderne",
    sublabel: "Noto Sans Arabic — épuré, contemporain",
    fontFamily: "'Noto Sans Arabic', sans-serif",
  },
];

export const DEFAULT_ARABIC_FONT_ID = "amiri";
