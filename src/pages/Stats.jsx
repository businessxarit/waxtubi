import { computePersonalStats } from "../lib/personalStats";
import "./Stats.css";

export default function Stats({ onBack }) {
  const stats = computePersonalStats();

  return (
    <div className="stats-page">
      <header className="stats-header">
        <button className="stats-back" onClick={onBack}>← Retour</button>
        <span className="home-eyebrow">Mes statistiques</span>
        <h1 className="stats-title">Ton parcours</h1>
      </header>

      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-value">{stats.dhikrStreak}</span>
          <span className="stats-label">jour{stats.dhikrStreak > 1 ? "s" : ""} de suite en dhikr</span>
        </div>
        <div className="stats-card">
          <span className="stats-value">{stats.totalDhikr.toLocaleString("fr-FR")}</span>
          <span className="stats-label">dhikr au total</span>
        </div>
        <div className="stats-card">
          <span className="stats-value">{stats.activeDhikrDays}</span>
          <span className="stats-label">jour{stats.activeDhikrDays > 1 ? "s" : ""} actif{stats.activeDhikrDays > 1 ? "s" : ""} en dhikr</span>
        </div>
        <div className="stats-card">
          <span className="stats-value">{stats.fastingDays}</span>
          <span className="stats-label">jour{stats.fastingDays > 1 ? "s" : ""} de jeûne enregistré{stats.fastingDays > 1 ? "s" : ""}</span>
        </div>
      </div>

      <p className="stats-note">
        Calculé à partir de ce que tu as enregistré dans Dhikr et dans le
        suivi de jeûne du Calendrier — stocké sur cet appareil (et
        synchronisé si tu as un compte).
      </p>
    </div>
  );
}
