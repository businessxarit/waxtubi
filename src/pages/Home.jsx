import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { usePrayerNotifications } from "../hooks/usePrayerNotifications";
import GraduatedArc from "../components/GraduatedArc";
import "./Home.css";

const ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function formatCountdown(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export default function Home() {
  const { data, next, geoStatus, error, loading, position } = usePrayerTimes();
  const notifications = usePrayerNotifications(data?.timings);

  return (
    <div className="home-page">
      <header className="home-header home-fade-in">
        <span className="home-eyebrow">Waxtubi</span>
        <h1 className="home-city">
          {position?.isFallback ? "Dakar" : "Votre position"}
          {geoStatus === "denied" && (
            <span className="home-geo-note"> · position par défaut</span>
          )}
        </h1>
        {data && (
          <p className="home-date">
            {data.gregorian.day} {data.gregorian.month.en} {data.gregorian.year} ·{" "}
            {data.hijri.day} {data.hijri.month.en} {data.hijri.year}h
          </p>
        )}

        {notifications.supported && (
          <button
            className={`notif-toggle ${notifications.enabled ? "is-active" : ""}`}
            onClick={() => notifications.setEnabled(!notifications.enabled)}
          >
            {notifications.enabled ? "🔔 Rappels activés" : "🔕 Activer les rappels de prière"}
          </button>
        )}
        {notifications.permission === "denied" && (
          <p className="notif-denied-note">
            Notifications bloquées — autorise-les dans les réglages de ton navigateur pour recevoir les rappels.
          </p>
        )}
      </header>

      <section className="home-arc-section home-fade-in" style={{ animationDelay: "0.1s" }}>
        {loading && <p className="home-status">Calcul des horaires…</p>}
        {error && <p className="home-status home-error">{error}</p>}
        {next && (
          <GraduatedArc
            size={240}
            progress={1 - next.minutesUntil / (24 * 60)}
            label="Prochaine prière"
            value={next.current.label}
            sublabel={`dans ${formatCountdown(next.minutesUntil)}`}
          />
        )}
      </section>

      {data && (
        <ul className="home-timings-list">
          {ORDER.map((key, i) => {
            const t = data.timings[key];
            const isNext = next?.current.key === key;
            return (
              <li
                key={key}
                className={`timing-row ${isNext ? "is-next" : ""} home-stagger-in`}
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
              >
                <span className="timing-label">{t.label}</span>
                <span className="timing-tick" aria-hidden="true" />
                <span className="timing-time">{t.time}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
