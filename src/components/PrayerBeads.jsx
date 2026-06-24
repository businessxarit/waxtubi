import { useRef, useCallback } from "react";
import "./PrayerBeads.css";

const VISIBLE_BEADS = 9; // nombre de perles visibles à l'écran à la fois

/**
 * PrayerBeads — chapelet de tasbih linéaire, qu'on fait défiler en
 * glissant le doigt (ou en tapant) pour incrémenter le compteur.
 * Remplace l'arc gradué pour la page Dhikr (identité visuelle propre
 * à Waxtubi : perles rendues en CSS, pas une copie d'une autre app).
 */
export default function PrayerBeads({ count, cycleLength, onIncrement, disabled = false }) {
  const lastDragX = useRef(null);
  const dragDistance = useRef(0);

  const positionInCycle = count % cycleLength;

  const handlePointerDown = useCallback((e) => {
    if (disabled) return;
    lastDragX.current = e.clientX;
    dragDistance.current = 0;
  }, [disabled]);

  const handlePointerMove = useCallback(
    (e) => {
      if (disabled || lastDragX.current === null) return;
      const delta = e.clientX - lastDragX.current;
      dragDistance.current += Math.abs(delta);
      // Glisser d'environ 28px fait avancer d'une perle
      if (Math.abs(delta) > 28) {
        onIncrement();
        lastDragX.current = e.clientX;
      }
    },
    [onIncrement, disabled]
  );

  const handlePointerUp = useCallback(() => {
    if (disabled) {
      lastDragX.current = null;
      dragDistance.current = 0;
      return;
    }
    // Un simple tap (pas de vrai glissement) compte aussi comme une perle
    if (lastDragX.current !== null && dragDistance.current < 6) {
      onIncrement();
    }
    lastDragX.current = null;
    dragDistance.current = 0;
  }, [onIncrement, disabled]);

  const beads = Array.from({ length: VISIBLE_BEADS });
  const centerIndex = Math.floor(VISIBLE_BEADS / 2);

  return (
    <div
      className={`beads-track ${disabled ? "is-disabled" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Glisser ou toucher pour compter une perle"
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) onIncrement();
      }}
    >
      <div className="beads-guide-line" />
      <div className="beads-marker" />
      {beads.map((_, i) => {
        const offsetFromCenter = i - centerIndex;
        const beadGlobalIndex = positionInCycle + offsetFromCenter;
        const isPassed = offsetFromCenter < 0;
        const isCurrent = offsetFromCenter === 0;
        const distance = Math.abs(offsetFromCenter);
        const scale = Math.max(0.55, 1 - distance * 0.12);
        const opacity = Math.max(0.25, 1 - distance * 0.13);

        return (
          <div
            key={i}
            className={`bead ${isCurrent ? "bead-current" : ""} ${isPassed ? "bead-passed" : "bead-upcoming"}`}
            style={{
              transform: `translateX(${offsetFromCenter * 44}px) scale(${scale})`,
              opacity,
              zIndex: VISIBLE_BEADS - distance,
            }}
            data-index={((beadGlobalIndex % cycleLength) + cycleLength) % cycleLength}
          />
        );
      })}
    </div>
  );
}
