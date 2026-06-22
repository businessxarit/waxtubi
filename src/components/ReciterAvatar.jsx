// Avatar stylisé pour un récitateur : aucune photo réelle utilisée
// (droit à l'image des personnes), juste une silhouette géométrique
// abstraite + initiales, dans l'esprit visuel Waxtubi (cuivre/laiton
// sur fond sapin). La couleur d'accent est dérivée du nom de façon
// déterministe : un même récitateur garde toujours la même teinte.

const ACCENT_PALETTE = ["#C97D3C", "#7A9B8E", "#D4AF6A", "#B8682E", "#5F7D70"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function ReciterAvatar({ label, size = 44, selected = false }) {
  const accent = ACCENT_PALETTE[hashString(label) % ACCENT_PALETTE.length];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={label}
      style={{ flexShrink: 0, borderRadius: "50%" }}
    >
      <circle cx="24" cy="24" r="24" fill="var(--ink-raised)" />
      {/* Silhouette géométrique abstraite : un disque + un arc, pas de visage */}
      <circle cx="24" cy="18" r="8" fill={accent} opacity="0.9" />
      <path d="M8 42c0-9 7-15 16-15s16 6 16 15" fill={accent} opacity="0.9" />
      <circle
        cx="24" cy="24" r="23"
        fill="none"
        stroke={selected ? "var(--copper-bright)" : "transparent"}
        strokeWidth="2"
      />
    </svg>
  );
}
