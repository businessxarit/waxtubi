import "./NavBar.css";

const TABS = [
  { id: "home", label: "Waxtu", icon: SunIcon },
  { id: "quran", label: "Coran", icon: BookIcon },
  { id: "qibla", label: "Qibla", icon: CompassIcon },
  { id: "dhikr", label: "Dhikr", icon: BeadsIcon },
  { id: "hijri", label: "Calendrier", icon: MoonIcon },
  { id: "sira", label: "Sira", icon: ScrollIcon },
];

export default function NavBar({ active, onChange }) {
  return (
    <nav className="navbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            className={`navbar-btn ${isActive ? "is-active" : ""}`}
            onClick={() => onChange(tab.id)}
            aria-current={isActive}
          >
            <Icon active={isActive} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SunIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" stroke={active ? "var(--copper-bright)" : "currentColor"} strokeWidth="1.7" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        const x1 = 12 + 7.5 * Math.cos(a), y1 = 12 + 7.5 * Math.sin(a);
        const x2 = 12 + 10 * Math.cos(a), y2 = 12 + 10 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? "var(--copper-bright)" : "currentColor"} strokeWidth="1.7" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function BookIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--copper-bright)" : "currentColor"} strokeWidth="1.7">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5V5.5Z" />
      <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v16h5.5c.8 0 1.5-.7 1.5-1.5V5.5Z" />
    </svg>
  );
}

function CompassIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--copper-bright)" : "currentColor"} strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,7 14,12 12,17 10,12" fill={active ? "var(--copper-bright)" : "currentColor"} stroke="none" />
    </svg>
  );
}

function BeadsIcon({ active }) {
  const color = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * 60 - 60) * (Math.PI / 180);
        const cx = 12 + 7 * Math.cos(a), cy = 14 + 7 * Math.sin(a) - 2;
        return <circle key={i} cx={cx} cy={cy} r="2.1" fill={color} />;
      })}
    </svg>
  );
}

function MoonIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "var(--copper-bright)" : "currentColor"}>
      <path d="M14 3.5c-4.5.6-8 4.5-8 9.2 0 5.1 4.2 9.3 9.3 9.3 3.7 0 6.9-2.2 8.4-5.3-1 .4-2 .6-3.1.6-5.1 0-9.3-4.2-9.3-9.3 0-1.6.4-3.2 1.1-4.5z" />
    </svg>
  );
}

function ScrollIcon({ active }) {
  const color = active ? "var(--copper-bright)" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7">
      <path d="M6 4.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8" />
      <path d="M6 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2" />
      <line x1="9" y1="9" x2="14" y2="9" />
      <line x1="9" y1="13" x2="14" y2="13" />
    </svg>
  );
}
