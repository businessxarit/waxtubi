import { useMemo } from "react";
import "./GraduatedArc.css";

/**
 * GraduatedArc — élément signature de Waxtubi.
 * Un arc gradué façon astrolabe/cadran solaire, utilisé pour :
 * - le compte à rebours vers la prochaine prière (page Accueil)
 * - le compteur de dhikr (page Dhikr)
 * - la progression de lecture du Coran (page Coran)
 *
 * progress: 0 → 1
 * ticks: nombre de graduations affichées sur l'arc (mode "traits")
 * beadMode: si vrai, remplace les traits par des perles rondes qui
 *   s'allument une à une au fil de "progress" (utilisé pour le Dhikr)
 * beadCount: nombre de perles affichées en mode perles (par défaut = ticks)
 */
export default function GraduatedArc({
  progress = 0,
  size = 220,
  strokeWidth = 3,
  ticks = 40,
  accent = "var(--copper)",
  label,
  value,
  sublabel,
  children,
  beadMode = false,
  beadCount,
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const radius = size / 2 - strokeWidth * 4;
  const startAngle = -210; // arc ouvert en bas, comme un cadran solaire posé
  const sweep = 240;
  const totalBeads = beadCount ?? ticks;

  const polar = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: size / 2 + r * Math.cos(rad),
      y: size / 2 + r * Math.sin(rad),
    };
  };

  const describeArc = (r, a0, a1) => {
    const p0 = polar(a0, r);
    const p1 = polar(a1, r);
    const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
  };

  const tickMarks = useMemo(() => {
    if (beadMode) return null;
    const marks = [];
    for (let i = 0; i <= ticks; i++) {
      const angle = startAngle + (sweep * i) / ticks;
      const isMajor = i % 5 === 0;
      const r1 = radius + strokeWidth * 1.6;
      const r2 = radius + strokeWidth * (isMajor ? 4.2 : 2.8);
      const p1 = polar(angle, r1);
      const p2 = polar(angle, r2);
      marks.push(
        <line
          key={i}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="var(--brass)"
          strokeWidth={isMajor ? 1.4 : 0.8}
          opacity={isMajor ? 0.85 : 0.4}
        />
      );
    }
    return marks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks, radius, strokeWidth, beadMode]);

  const beads = useMemo(() => {
    if (!beadMode) return null;
    const litCount = Math.round(clamped * totalBeads);
    const beadRadius = radius;
    const marks = [];
    for (let i = 0; i < totalBeads; i++) {
      const angle = startAngle + (sweep * i) / Math.max(1, totalBeads - 1);
      const p = polar(angle, beadRadius);
      const isLit = i < litCount;
      const isLast = i === litCount - 1;
      marks.push(
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={isLast ? strokeWidth * 1.9 : strokeWidth * 1.5}
          fill={isLit ? accent : "var(--ink-raised)"}
          opacity={isLit ? 1 : 0.6}
          className={isLast ? "arc-bead arc-bead-active" : "arc-bead"}
        />
      );
    }
    return marks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beadMode, clamped, totalBeads, radius, strokeWidth, accent]);

  const trackPath = describeArc(radius, startAngle, startAngle + sweep);
  const progressPath = describeArc(radius, startAngle, startAngle + sweep * clamped);
  const pathLen = (2 * Math.PI * radius * sweep) / 360;

  return (
    <div className="arc-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {tickMarks}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--ink-raised)"
          strokeWidth={beadMode ? 1.5 : strokeWidth}
          strokeLinecap="round"
        />
        {!beadMode && (
          <path
            d={progressPath}
            fill="none"
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={pathLen}
            className="arc-progress"
          />
        )}
        {beads}
      </svg>
      <div className="arc-center">
        {children ? (
          children
        ) : (
          <>
            {label && <span className="arc-label">{label}</span>}
            {value && <span className="arc-value">{value}</span>}
            {sublabel && <span className="arc-sublabel">{sublabel}</span>}
          </>
        )}
      </div>
    </div>
  );
}
