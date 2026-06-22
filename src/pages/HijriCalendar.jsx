import { useEffect, useState } from "react";
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

export default function HijriCalendar() {
  const [currentYear, setCurrentYear] = useState(null);
  const [currentMonthNumber, setCurrentMonthNumber] = useState(null);

  useEffect(() => {
    // Récupère juste la date Hijri du jour (sans géoloc, peu importe la
    // ville pour le numéro de mois/année) pour mettre en avant le mois actuel.
    fetch("https://api.aladhan.com/v1/gToH")
      .then((res) => res.json())
      .then((json) => {
        setCurrentYear(json.data.hijri.year);
        setCurrentMonthNumber(Number(json.data.hijri.month.number));
      })
      .catch(() => {
        // En cas d'échec silencieux, on affiche simplement la liste sans surlignage
      });
  }, []);

  return (
    <div className="hijri-page">
      <header className="hijri-header">
        <span className="home-eyebrow">Calendrier</span>
        <h1 className="hijri-title">
          Mois du calendrier hijri{currentYear ? ` · ${currentYear}h` : ""}
        </h1>
      </header>

      <ul className="hijri-month-grid">
        {HIJRI_MONTHS.map((m) => {
          const isCurrent = m.number === currentMonthNumber;
          return (
            <li key={m.number} className={`hijri-month-card ${isCurrent ? "is-current" : ""}`}>
              <span className="hijri-month-number">{m.number}</span>
              <span className="hijri-month-name">{m.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
