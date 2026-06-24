import { useState, useEffect } from "react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { usePrayerNotifications } from "../hooks/usePrayerNotifications";
import { useFirstName } from "../hooks/useFirstName";
import { useAuth } from "../hooks/useAuth";
import { fetchTodaysVerse } from "../lib/verseOfTheDay";
import {
  togglePrayerDone,
  getTodaysPrayerLog,
  syncPrayerLogToCloud,
  mergePrayerLogFromCloud,
} from "../lib/prayerTracker";
import GraduatedArc from "../components/GraduatedArc";
import "./Home.css";

const ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const VERSE_LANG_STORAGE_KEY = "waxtubi:quran:lang"; // même clé que la page Coran, pour rester cohérent

function formatCountdown(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export default function Home() {
  const { data, next, geoStatus, error, loading, position } = usePrayerTimes();
  const notifications = usePrayerNotifications(data?.timings);
  const { firstName, setFirstName } = useFirstName();
  const { user } = useAuth();
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [verse, setVerse] = useState(null);
  const [verseError, setVerseError] = useState(null);
  const [prayerLog, setPrayerLog] = useState(() => getTodaysPrayerLog());

  useEffect(() => {
    const lang = localStorage.getItem(VERSE_LANG_STORAGE_KEY) || "fr";
    let cancelled = false;
    fetchTodaysVerse(lang)
      .then((v) => {
        if (!cancelled) setVerse(v);
      })
      .catch((e) => {
        if (!cancelled) setVerseError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Récupère le suivi de prière du jour depuis le cloud si un compte réel existe
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    let cancelled = false;
    mergePrayerLogFromCloud(user.uid).then((merged) => {
      if (!cancelled) setPrayerLog(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleTogglePrayer(prayerKey) {
    togglePrayerDone(prayerKey);
    setPrayerLog(getTodaysPrayerLog());
    if (user && !user.isAnonymous) {
      syncPrayerLogToCloud(user.uid).catch(() => {
        // Échec silencieux : la coche reste correcte localement
      });
    }
  }

  function saveName() {
    setFirstName(nameInput);
    setNameInput("");
    setShowNameEditor(false);
  }

  const prayerKeysOnly = ORDER.filter((k) => k !== "Sunrise");
  const doneCount = prayerKeysOnly.filter((k) => prayerLog[k]).length;

  return (
    <div className="home-page">
      <header className="home-header home-fade-in">
        <span className="home-eyebrow">Waxtubi</span>

        {firstName ? (
          <p className="home-greeting">
            As-salamu alaykum, {firstName}
            <button className="home-greeting-edit" onClick={() => setShowNameEditor(true)} aria-label="Modifier le prénom">
              ✎
            </button>
          </p>
        ) : (
          !showNameEditor && (
            <button className="home-greeting-add" onClick={() => setShowNameEditor(true)}>
              + Ajouter ton prénom
            </button>
          )
        )}

        {showNameEditor && (
          <div className="home-name-editor">
            <input
              type="text"
              placeholder="Ton prénom"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
              }}
              autoFocus
            />
            <button onClick={saveName}>OK</button>
          </div>
        )}

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
        <>
          <div className="prayer-progress home-fade-in" style={{ animationDelay: "0.12s" }}>
            <span className="prayer-progress-count">{doneCount}/5</span>
            <span className="prayer-progress-label">prière{doneCount !== 1 ? "s" : ""} accomplie{doneCount !== 1 ? "s" : ""} aujourd'hui</span>
          </div>

          <ul className="home-timings-list">
            {ORDER.map((key, i) => {
              const t = data.timings[key];
              const isNext = next?.current.key === key;
              const isPrayer = key !== "Sunrise";
              const isDone = isPrayer && Boolean(prayerLog[key]);
              return (
                <li
                  key={key}
                  className={`timing-row ${isNext ? "is-next" : ""} home-stagger-in`}
                  style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                >
                  {isPrayer && (
                    <button
                      className={`prayer-check-btn ${isDone ? "is-done" : ""}`}
                      onClick={() => handleTogglePrayer(key)}
                      aria-label={isDone ? `${t.label} marquée comme priée — toucher pour annuler` : `Marquer ${t.label} comme priée`}
                    >
                      {isDone ? "✓" : "○"}
                    </button>
                  )}
                  <span className="timing-label">{t.label}</span>
                  <span className="timing-tick" aria-hidden="true" />
                  <span className="timing-time">{t.time}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <section className="verse-of-day home-fade-in" style={{ animationDelay: "0.3s" }}>
        <span className="verse-of-day-label">📖 Verset du jour</span>
        {verseError && <p className="home-status home-error">{verseError}</p>}
        {!verse && !verseError && <p className="home-status">Chargement…</p>}
        {verse && (
          <>
            <p className="verse-of-day-arabic" lang="ar" dir="rtl">{verse.arabic}</p>
            <p className="verse-of-day-translation">{verse.translation}</p>
            <p className="verse-of-day-ref">{verse.surahName} · {verse.surahNumber}:{verse.ayahNumber}</p>
          </>
        )}
      </section>
    </div>
  );
}
