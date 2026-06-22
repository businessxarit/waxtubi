// Motif ornemental géométrique original (étoiles à 8 branches répétées),
// inspiré du vocabulaire général de l'art islamique mais dessiné depuis
// zéro — pas une reproduction d'une page de Coran imprimée existante.

export default function OrnamentalBorder({ width = "100%", height = 28 }) {
  const starCount = 14;
  const stars = Array.from({ length: starCount }, (_, i) => i);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${starCount * 24} 28`} preserveAspectRatio="none" className="ornamental-border">
      <rect x="0" y="0" width={starCount * 24} height="28" rx="6" fill="var(--ink-soft)" stroke="var(--brass)" strokeWidth="1" />
      {stars.map((i) => {
        const cx = 12 + i * 24;
        const cy = 14;
        const r1 = 7;
        const r2 = 3.2;
        const points = [];
        for (let k = 0; k < 16; k++) {
          const angle = (Math.PI / 8) * k;
          const r = k % 2 === 0 ? r1 : r2;
          points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <polygon
            key={i}
            points={points.join(" ")}
            fill="none"
            stroke="var(--brass)"
            strokeWidth="0.8"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}
