import { useEffect, useState, useCallback, useRef } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { getQiblaDirection, getDistanceToMecca } from "../lib/prayerTimes";
import "./Qibla.css";

// Détecte une fois si la permission explicite iOS est nécessaire.
// (DeviceOrientationEvent.requestPermission n'existe que sur iOS 13+ Safari)
const REQUIRES_EXPLICIT_PERMISSION =
  typeof window !== "undefined" &&
  typeof window.DeviceOrientationEvent !== "undefined" &&
  typeof window.DeviceOrientationEvent.requestPermission === "function";

export default function Qibla() {
  const { position, status } = useGeolocation();
  const [heading, setHeading] = useState(null);
  const [compassActive, setCompassActive] = useState(false);
  const listenerAttached = useRef(false);

  const qiblaAngle = position ? getQiblaDirection(position.lat, position.lng) : null;
  const distance = position ? getDistanceToMecca(position.lat, position.lng) : null;

  const handleOrientation = useCallback((event) => {
    const alpha = event.webkitCompassHeading ?? (event.alpha != null ? 360 - event.alpha : null);
    if (typeof alpha === "number" && !Number.isNaN(alpha)) {
      setHeading(alpha);
      setCompassActive(true);
    }
  }, []);

  const attachListener = useCallback(() => {
    if (listenerAttached.current) return;
    listenerAttached.current = true;
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }, [handleOrientation]);

  useEffect(() => {
    if (!REQUIRES_EXPLICIT_PERMISSION) {
      attachListener();
    }
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [attachListener, handleOrientation]);

  async function requestCompassAccess() {
    try {
      const result = await window.DeviceOrientationEvent.requestPermission();
      if (result === "granted") {
        attachListener();
      }
    } catch {
      // L'utilisateur a refusé ou le navigateur ne supporte pas — on reste
      // sur l'affichage de l'angle Qibla statique (sans boussole live).
    }
  }

  const needleRotation =
    qiblaAngle !== null ? qiblaAngle - (compassActive ? heading || 0 : 0) : 0;

  return (
    <div className="qibla-page">
      <header className="qibla-header">
        <span className="home-eyebrow">Qibla</span>
        <h1 className="qibla-title">Direction de la Mecque</h1>
        {position && qiblaAngle !== null && (
          <p className="qibla-meta">
            {Math.round(qiblaAngle)}° depuis le Nord
            {distance && <> · {distance.toLocaleString("fr-FR")} km</>}
          </p>
        )}
      </header>

      {status === "loading" && (
        <p className="qibla-status">Localisation en cours…</p>
      )}

      {REQUIRES_EXPLICIT_PERMISSION && !compassActive && (
        <button className="qibla-permission-btn" onClick={requestCompassAccess}>
          Activer la boussole
        </button>
      )}

      {qiblaAngle !== null && (
        <div className="qibla-compass">
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* cercle gradué façon astrolabe */}
            <circle cx="140" cy="140" r="120" fill="none" stroke="var(--ink-raised)" strokeWidth="2" />
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180;
              const isMajor = i % 9 === 0;
              const r1 = isMajor ? 100 : 108;
              const r2 = 120;
              const x1 = 140 + r1 * Math.sin(angle);
              const y1 = 140 - r1 * Math.cos(angle);
              const x2 = 140 + r2 * Math.sin(angle);
              const y2 = 140 - r2 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--brass)"
                  strokeWidth={isMajor ? 1.6 : 0.8}
                  opacity={isMajor ? 0.9 : 0.45}
                />
              );
            })}
            <text x="140" y="32" textAnchor="middle" fill="var(--sand-dim)" fontSize="13" fontFamily="var(--font-mono)">N</text>
            <text x="140" y="256" textAnchor="middle" fill="var(--sand-dim)" fontSize="13" fontFamily="var(--font-mono)">S</text>
            <text x="252" y="145" textAnchor="middle" fill="var(--sand-dim)" fontSize="13" fontFamily="var(--font-mono)">E</text>
            <text x="28" y="145" textAnchor="middle" fill="var(--sand-dim)" fontSize="13" fontFamily="var(--font-mono)">O</text>

            {/* aiguille Qibla */}
            <g transform={`rotate(${needleRotation} 140 140)`} className="qibla-needle">
              <line x1="140" y1="140" x2="140" y2="48" stroke="var(--copper)" strokeWidth="4" strokeLinecap="round" />
              <polygon points="140,38 132,58 148,58" fill="var(--copper)" />
              <circle cx="140" cy="140" r="7" fill="var(--copper-bright)" />
            </g>
          </svg>
          <p className="qibla-instruction">
            {compassActive
              ? "Tournez-vous jusqu'à ce que la flèche pointe vers le haut"
              : "Orientez votre téléphone à plat pour activer la boussole"}
          </p>
        </div>
      )}
    </div>
  );
}
