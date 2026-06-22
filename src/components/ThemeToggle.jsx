import "./ThemeToggle.css";

const OPTIONS = [
  { id: "auto", label: "Auto", icon: "◐" },
  { id: "light", label: "Clair", icon: "☀" },
  { id: "dark", label: "Sombre", icon: "☾" },
];

export default function ThemeToggle({ preference, onChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Thème de l'application">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          className={`theme-toggle-btn ${preference === opt.id ? "is-active" : ""}`}
          onClick={() => onChange(opt.id)}
          aria-pressed={preference === opt.id}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
