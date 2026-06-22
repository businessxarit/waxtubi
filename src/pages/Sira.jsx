import { useState } from "react";
import { SIRA_TIMELINE, SAHABA_PROFILES } from "../lib/siraContent";
import "./Sira.css";

export default function Sira() {
  const [tab, setTab] = useState("timeline"); // "timeline" | "sahabas"
  const [openSahabaId, setOpenSahabaId] = useState(null);

  return (
    <div className="sira-page">
      <header className="sira-header">
        <span className="home-eyebrow">Sira</span>
        <h1 className="sira-title">Vie du Prophète &amp; Sahabas</h1>
        <div className="sira-tab-switch" role="group" aria-label="Section">
          <button className={tab === "timeline" ? "is-active" : ""} onClick={() => setTab("timeline")}>
            Chronologie
          </button>
          <button className={tab === "sahabas" ? "is-active" : ""} onClick={() => setTab("sahabas")}>
            Sahabas
          </button>
        </div>
      </header>

      {tab === "timeline" && (
        <>
          <ol className="sira-timeline">
            {SIRA_TIMELINE.map((event, i) => (
              <li key={i} className="sira-event">
                <span className="sira-event-year">{event.year}</span>
                <div className="sira-event-body">
                  <h2 className="sira-event-title">{event.title}</h2>
                  <p className="sira-event-text">{event.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="sira-source-note">
            Repères historiques largement reconnus dans les biographies islamiques
            classiques (Sira). Les dates antérieures à l'Hégire sont approximatives,
            comme dans l'ensemble de la littérature sur le sujet. Contenu à visée
            d'étude générale — pas un avis savant (fatwa).
          </p>
        </>
      )}

      {tab === "sahabas" && (
        <>
          <ul className="sahaba-list">
            {SAHABA_PROFILES.map((s) => {
              const isOpen = openSahabaId === s.id;
              return (
                <li key={s.id} className="sahaba-card">
                  <button
                    className="sahaba-card-header"
                    onClick={() => setOpenSahabaId(isOpen ? null : s.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="sahaba-info">
                      <span className="sahaba-name">{s.name}</span>
                      <span className="sahaba-role">{s.title}</span>
                    </span>
                    <span className="sahaba-arabic" lang="ar" dir="rtl">{s.arabic}</span>
                  </button>
                  {isOpen && <p className="sahaba-text">{s.text}</p>}
                </li>
              );
            })}
          </ul>
          <p className="sira-source-note">
            Faits biographiques largement admis. Le statut respectif des trois
            premiers califes fait l'objet d'un désaccord de fond entre traditions
            sunnite et chiite, non tranché ici. Contenu à visée d'étude générale —
            pas un avis savant (fatwa).
          </p>
        </>
      )}
    </div>
  );
}
