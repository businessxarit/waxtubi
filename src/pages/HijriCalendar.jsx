import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  toggleFastingDay,
  getLocalFastingLog,
  syncFastingLogToCloud,
  mergeFastingLogFromCloud,
} from "../lib/fastingTracker";
import "./HijriCalendar.css";

const HIJRI_MONTHS = [
  { number: 1, name: "Mouharram" },
  { number: 2, name: "Safar" },
  { number: 3, name: "Rabi' al-awwal" },
  { number: 4, name: "Rabi' ath-thani" },
  { number: 5, name: "Joumada al-awwal" },
  { number: 6, name: "Joumada ath-thania" },
  { number: 7, name: "Rajab" },
  { number: 8, name: "Cha'ban" },
  { number: 9, name: "Ramadan" },
  { number: 10, name: "Chawwal" },
  { number: 11, name: "Dhou al-Qi'da" },
  { number: 12, name: "Dhou al-Hijja" },
];

// Jours Blancs (Ayyam al-Bid) : 13, 14 et 15 de chaque mois hijri —
// nuits de pleine lune. Jeûne sunna confirmé (le Prophète ﷺ ne les
// délaissait jamais, en voyage comme à demeure — Sunan an-Nasa'i n°2422).
const WHITE_DAYS = [13, 14, 15];

export default function HijriCalendar() {
  const [currentYear, setCurrentYear] = useState(null);
  const [currentMonthNumber, setCurrentMonthNumber] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [openMonth, setOpenMonth] = useState(null); // numéro de mois ouvert en détail, ou null

  useEffect(() => {
    // Récupère juste la date Hijri du jour (sans géoloc, peu importe la
    // ville pour le numéro de mois/année) pour mettre en avant le mois actuel.
    fetch("https://api.aladhan.com/v1/gToH")
      .then((res) => res.json())
      .then((json) => {
        setCurrentYear(json.data.hijri.year);
        setCurrentMonthNumber(Number(json.data.hijri.month.number));
        setCurrentDay(Number(json.data.hijri.day));
      })
      .catch(() => {
        // En cas d'échec silencieux, on affiche simplement la liste sans surlignage
      });
  }, []);

  if (openMonth !== null && currentYear) {
    return (
      <MonthDetailView
        monthNumber={openMonth}
        year={currentYear}
        isCurrentMonth={openMonth === currentMonthNumber}
        currentDay={currentDay}
        onBack={() => setOpenMonth(null)}
      />
    );
  }

  return (
    <div className="hijri-page">
      <header className="hijri-header">
        <span className="home-eyebrow">Calendrier</span>
        <h1 className="hijri-title">
          Année hijri{currentYear ? ` · ${currentYear}h` : ""}
        </h1>
      </header>

      <ul className="hijri-month-grid">
        {HIJRI_MONTHS.map((m) => {
          const isCurrent = m.number === currentMonthNumber;
          return (
            <li key={m.number}>
              <button
                className={`hijri-month-card ${isCurrent ? "is-current" : ""}`}
                onClick={() => setOpenMonth(m.number)}
              >
                <span className="hijri-month-number">{m.number}</span>
                <span className="hijri-month-name">{m.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {currentYear && (
        <YearWhiteDaysOverview
          year={currentYear}
          currentMonthNumber={currentMonthNumber}
          currentDay={currentDay}
          onOpenMonth={setOpenMonth}
        />
      )}
    </div>
  );
}

/**
 * Liste des Jours Blancs des 12 mois de l'année hijri en cours,
 * calculée en direct (pas codée en dur).
 */
function YearWhiteDaysOverview({ year, currentMonthNumber, currentDay, onOpenMonth }) {
  const [allWhiteDays, setAllWhiteDays] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const perMonth = await Promise.all(
          HIJRI_MONTHS.map(async (m) => {
            const days = await Promise.all(
              WHITE_DAYS.map(async (day) => {
                const res = await fetch(
                  `https://api.aladhan.com/v1/hToG/${String(day).padStart(2, "0")}-${String(m.number).padStart(2, "0")}-${year}`
                );
                if (!res.ok) throw new Error("Conversion de date indisponible");
                const json = await res.json();
                return { hijriDay: day, gregorian: json.data.gregorian };
              })
            );
            return { monthNumber: m.number, monthName: m.name, days };
          })
        );
        if (!cancelled) setAllWhiteDays(perMonth);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  return (
    <section className="white-days-section">
      <h2 className="white-days-title">🌕 Jours Blancs de l'année</h2>
      <p className="white-days-subtitle">
        Les 13, 14 et 15 de chaque mois hijri — jeûne sunna confirmé, le
        Prophète ﷺ ne les délaissait jamais, en voyage comme à demeure.
      </p>

      {error && <p className="hijri-status hijri-error">{error}</p>}
      {!allWhiteDays && !error && <p className="hijri-status">Calcul des dates de l'année…</p>}

      {allWhiteDays && (
        <ul className="white-days-year-list">
          {allWhiteDays.map((month) => {
            const isCurrentMonth = month.monthNumber === currentMonthNumber;
            return (
              <li key={month.monthNumber} className={`white-days-month-block ${isCurrentMonth ? "is-current-month" : ""}`}>
                <button className="white-days-month-header" onClick={() => onOpenMonth(month.monthNumber)}>
                  {month.monthName}
                </button>
                <ul className="white-days-list">
                  {month.days.map((d) => {
                    const isToday = isCurrentMonth && d.hijriDay === currentDay;
                    return (
                      <li key={d.hijriDay} className={`white-day-row ${isToday ? "is-today" : ""}`}>
                        <span className="white-day-hijri">{d.hijriDay} {month.monthName}</span>
                        <span className="white-day-tick" aria-hidden="true" />
                        <span className="white-day-gregorian">
                          {d.gregorian.day} {d.gregorian.month.en}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      <p className="white-days-source-note">
        Source : hadith rapporté par Ibn Abbas (Sunan an-Nasa'i n°2422).
        Les dates peuvent varier d'un jour selon l'observation lunaire locale.
      </p>
    </section>
  );
}

/**
 * Vue détaillée jour par jour d'un mois hijri donné, avec les Jours
 * Blancs mis en évidence et un suivi de jeûne par jour (cocher manuel,
 * stocké localement et synchronisé au compte si connecté).
 */
function MonthDetailView({ monthNumber, year, isCurrentMonth, currentDay, onBack }) {
  const [days, setDays] = useState(null);
  const [error, setError] = useState(null);
  const [fastingLog, setFastingLog] = useState(() => getLocalFastingLog());
  const { user } = useAuth();
  const monthName = HIJRI_MONTHS[monthNumber - 1]?.name;

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.aladhan.com/v1/hToGCalendar/${monthNumber}/${year}`)
      .then((res) => {
        if (!res.ok) throw new Error("Calendrier du mois indisponible");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setDays(json.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [monthNumber, year]);

  // Récupère le journal de jeûne depuis le cloud si un compte réel existe
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    let cancelled = false;
    mergeFastingLogFromCloud(user.uid).then((merged) => {
      if (!cancelled) setFastingLog(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleToggleFasting(hijriDay) {
    const isNowMarked = toggleFastingDay(year, monthNumber, hijriDay);
    setFastingLog(getLocalFastingLog());
    if (user && !user.isAnonymous) {
      syncFastingLogToCloud(user.uid).catch(() => {
        // Échec silencieux : la coche reste correcte localement
      });
    }
    return isNowMarked;
  }

  return (
    <div className="hijri-page">
      <header className="hijri-header">
        <button className="month-detail-back" onClick={onBack} aria-label="Retour aux mois">
          ← Année
        </button>
        <span className="home-eyebrow">Calendrier</span>
        <h1 className="hijri-title">{monthName} · {year}h</h1>
      </header>

      {error && <p className="hijri-status hijri-error">{error}</p>}
      {!days && !error && <p className="hijri-status">Chargement du mois…</p>}

      {days && (
        <ul className="month-day-list">
          {days.map((d) => {
            const hijriDay = Number(d.hijri.day);
            const isToday = isCurrentMonth && hijriDay === currentDay;
            const isWhiteDay = WHITE_DAYS.includes(hijriDay);
            const dayKey = `${year}-${String(monthNumber).padStart(2, "0")}-${String(hijriDay).padStart(2, "0")}`;
            const isFasted = Boolean(fastingLog[dayKey]);
            return (
              <li key={hijriDay} className={`month-day-row ${isToday ? "is-today" : ""} ${isWhiteDay ? "is-white-day" : ""}`}>
                <span className="month-day-hijri">{hijriDay}</span>
                <span className="month-day-tick" aria-hidden="true" />
                <span className="month-day-gregorian">
                  {d.gregorian.weekday.en}, {d.gregorian.day} {d.gregorian.month.en} {d.gregorian.year}
                </span>
                {isWhiteDay && <span className="month-day-badge" title="Jour Blanc">🌕</span>}
                <button
                  className={`fasting-check-btn ${isFasted ? "is-fasted" : ""}`}
                  onClick={() => handleToggleFasting(hijriDay)}
                  aria-label={isFasted ? "Marqué comme jeûné — toucher pour annuler" : "Marquer comme jeûné"}
                  title={isFasted ? "Jeûné" : "Marquer comme jeûné"}
                >
                  {isFasted ? "✓" : "○"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
