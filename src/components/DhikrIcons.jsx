// Icônes pour les boutons du header Dhikr — même langage visuel que la
// navbar (traits fins, géométrique, cuivre quand actif), pour remplacer
// les emojis natifs dont le rendu varie selon l'appareil.

export function StatsIcon({ active }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
      <line x1="5" y1="20" x2="5" y2="13" />
      <line x1="12" y1="20" x2="12" y2="7" />
      <line x1="19" y1="20" x2="19" y2="11" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

export function TargetIcon({ active }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill={c} stroke="none" />
    </svg>
  );
}

export function DuaIcon({ active }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20c0-4.5 1.8-7.5 1.8-11" />
      <path d="M17 20c0-4.5-1.8-7.5-1.8-11" />
      <path d="M8.8 9c0-1.8.6-3.2 1.5-4.2" />
      <path d="M15.2 9c0-1.8-.6-3.2-1.5-4.2" />
    </svg>
  );
}

export function BeadsCircleIcon({ active }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i * 360) / 7 - 90;
        const rad = (angle * Math.PI) / 180;
        const cx = 12 + 7.5 * Math.cos(rad);
        const cy = 12 + 7.5 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="2" fill={c} />;
      })}
    </svg>
  );
}

export function AccountIcon({ active, hasRealAccount }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  if (hasRealAccount) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18c0-3 2.5-5.5 5.5-6.5C9 10 7 7.8 7 5.2 7 4 7.8 3 9 3" />
      <path d="M17 9c0-2.2-1.3-3.8-3-4.5" />
      <path d="M9 9c0 1.8 1.3 3.2 3 3.2" />
    </svg>
  );
}

export function SoundIcon({ active, enabled }) {
  const c = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4Z" />
      {enabled ? (
        <>
          <path d="M16.5 9c1 .9 1.6 2 1.6 3.2s-.6 2.3-1.6 3.2" />
          <path d="M18.7 6.8c1.7 1.5 2.6 3.4 2.6 5.4s-.9 3.9-2.6 5.4" />
        </>
      ) : (
        <line x1="17" y1="9" x2="21" y2="15" />
      )}
      {!enabled && <line x1="21" y1="9" x2="17" y2="15" />}
    </svg>
  );
}
