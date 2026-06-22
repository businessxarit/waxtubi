import { useEffect, useState } from "react";
import "./SplashScreen.css";

const TOTAL_DURATION_MS = 2200;

/**
 * Animation d'entrée de Waxtubi : l'arc gradué se dessine comme un
 * cadran solaire qui s'éveille, puis le nom apparaît en calligraphie.
 * S'efface ensuite vers l'app principale.
 */
export default function SplashScreen({ onFinish }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), TOTAL_DURATION_MS - 450);
    const finishTimer = setTimeout(() => onFinish(), TOTAL_DURATION_MS);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const size = 220;
  const radius = size / 2 - 14;
  const startAngle = -210;
  const sweep = 240;

  const polar = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: size / 2 + r * Math.cos(rad), y: size / 2 + r * Math.sin(rad) };
  };
  const describeArc = (r, a0, a1) => {
    const p0 = polar(a0, r);
    const p1 = polar(a1, r);
    const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
  };

  const pathLen = (2 * Math.PI * radius * sweep) / 360;
  const ticks = Array.from({ length: 25 }, (_, i) => {
    const angle = startAngle + (sweep * i) / 24;
    const isMajor = i % 4 === 0;
    const r1 = radius + (isMajor ? 6 : 4);
    const r2 = radius + (isMajor ? 16 : 11);
    const p1 = polar(angle, r1);
    const p2 = polar(angle, r2);
    return { p1, p2, isMajor, delay: 0.4 + i * 0.018 };
  });

  return (
    <div className={`splash-screen ${leaving ? "is-leaving" : ""}`} role="status" aria-label="Chargement de Waxtubi">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="splash-svg">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y}
            stroke="var(--brass)"
            strokeWidth={t.isMajor ? 1.6 : 0.9}
            className="splash-tick"
            style={{ animationDelay: `${t.delay}s` }}
          />
        ))}
        <path
          d={describeArc(radius, startAngle, startAngle + sweep)}
          fill="none"
          stroke="var(--copper)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLen}
          className="splash-arc"
          style={{ "--arc-length": pathLen }}
        />
      </svg>

      <div className="splash-wordmark">
        <span className="splash-arabic" lang="ar" dir="rtl">الوقت</span>
        <span className="splash-latin">Waxtubi</span>
      </div>
    </div>
  );
}
