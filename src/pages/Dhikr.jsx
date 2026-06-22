import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import PrayerBeads from "../components/PrayerBeads";
import AccountPanel from "../components/AccountPanel";
import { useBeadSound } from "../hooks/useBeadSound";
import { useSpeech } from "../hooks/useSpeech";
import { useAuth } from "../hooks/useAuth";
import { fetchDhikrCount, saveDhikrCount } from "../lib/dhikrSync";
import { fetchAsmaAlHusna } from "../lib/asmaAlHusna";
import "./Dhikr.css";

const CYCLE_LENGTH = 33; // cycle traditionnel du tasbih
const SAVE_DEBOUNCE_MS = 1500;

export default function Dhikr() {
  const { user, loading: authLoading } = useAuth();
  const [count, setCount] = useState(0);
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showNamesPanel, setShowNamesPanel] = useState(false);
  const { prefs, play, setEnabled, setVariant, setVolume } = useBeadSound();
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user || hasLoadedRemote) return;
    fetchDhikrCount(user.uid)
      .then((saved) => {
        setCount(saved);
        setHasLoadedRemote(true);
      })
      .catch(() => setHasLoadedRemote(true));
  }, [user, hasLoadedRemote]);

  useEffect(() => {
    if (!user || !hasLoadedRemote) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDhikrCount(user.uid, count).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [count, user, hasLoadedRemote]);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
    play();
  }, [play]);

  const reset = useCallback(() => setCount(0), []);

  const completedCycles = Math.floor(count / CYCLE_LENGTH);
  const hasRealAccount = user && !user.isAnonymous;

  function togglePanel(panel) {
    setShowAccountPanel(panel === "account" ? (s) => !s : false);
    setShowSoundPanel(panel === "sound" ? (s) => !s : false);
    setShowNamesPanel(panel === "names" ? (s) => !s : false);
  }

  return (
    <div className="dhikr-page">
      <header className="dhikr-header">
        <span className="home-eyebrow">Dhikr</span>
        <h1 className="dhikr-title">Compteur</h1>
        <div className="dhikr-header-actions">
          <button className="dhikr-icon-btn" onClick={() => togglePanel("names")} aria-label="Les 99 Noms d'Allah">
            📿
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("account")} aria-label="Compte">
            {hasRealAccount ? "👤" : "☁️"}
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("sound")} aria-label="Réglages du son">
            {prefs.enabled ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      {showNamesPanel && <AsmaAlHusnaPanel onClose={() => setShowNamesPanel(false)} />}

      {!authLoading && !hasRealAccount && !showAccountPanel && !showNamesPanel && (
        <p className="dhikr-account-nudge">
          <button onClick={() => togglePanel("account")}>
            Crée un compte pour garder ton compteur même en changeant de téléphone
          </button>
        </p>
      )}

      {showAccountPanel && <AccountPanel user={user} onClose={() => setShowAccountPanel(false)} />}

      {showSoundPanel && (
        <div className="dhikr-sound-panel">
          <label className="dhikr-sound-row">
            <span>Son</span>
            <input type="checkbox" checked={prefs.enabled} onChange={(e) => setEnabled(e.target.checked)} />
          </label>
          <div className="dhikr-sound-row">
            <span>Style</span>
            <div className="dhikr-variant-switch">
              <button className={prefs.variant === "soft" ? "is-active" : ""} onClick={() => setVariant("soft")}>Discret</button>
              <button className={prefs.variant === "rich" ? "is-active" : ""} onClick={() => setVariant("rich")}>Tactile</button>
            </div>
          </div>
          <label className="dhikr-sound-row">
            <span>Volume</span>
            <input type="range" min="0" max="1" step="0.05" value={prefs.volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </label>
        </div>
      )}

      {!showNamesPanel && (
        <>
          <div className="dhikr-count-display">
            <span className="dhikr-count-value">{count}</span>
            <span className="dhikr-count-sub">
              {completedCycles > 0 ? `${completedCycles} tour${completedCycles > 1 ? "s" : ""} complet${completedCycles > 1 ? "s" : ""}` : "Glisse ou touche les perles"}
            </span>
          </div>

          <PrayerBeads count={count} cycleLength={CYCLE_LENGTH} onIncrement={increment} />

          <button className="dhikr-reset-btn" onClick={reset}>
            Réinitialiser
          </button>
        </>
      )}
    </div>
  );
}

function AsmaAlHusnaPanel({ onClose }) {
  const [names, setNames] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const { speak, supported, hasArabicVoice } = useSpeech();

  useEffect(() => {
    fetchAsmaAlHusna().then(setNames).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!names) return [];
    const q = search.trim().toLowerCase();
    if (!q) return names;
    return names.filter(
      (n) => n.transliteration.toLowerCase().includes(q) || n.meaningEn.toLowerCase().includes(q) || String(n.number) === q
    );
  }, [names, search]);

  return (
    <div className="names-panel">
      <div className="names-panel-header">
        <h2 className="names-panel-title">Les 99 Noms d'Allah</h2>
        <button className="names-panel-close" onClick={onClose} aria-label="Fermer">✕</button>
      </div>

      {supported && hasArabicVoice === false && (
        <p className="names-voice-warning">
          Ton appareil n'a pas de voix arabe installée — la prononciation sera approximative.
        </p>
      )}
      {!supported && (
        <p className="names-voice-warning">
          La lecture audio n'est pas disponible sur cet appareil/navigateur.
        </p>
      )}

      <input
        className="names-search"
        type="text"
        placeholder="Rechercher un nom…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="dhikr-status dhikr-error">{error}</p>}
      {!names && !error && <p className="dhikr-status">Chargement des 99 Noms…</p>}

      <ul className="names-list">
        {filtered.map((n) => (
          <li key={n.number} className="names-row">
            <span className="names-number">{n.number}</span>
            <span className="names-arabic" lang="ar" dir="rtl">{n.arabic}</span>
            <span className="names-info">
              <span className="names-translit">{n.transliteration}</span>
              <span className="names-meaning">{n.meaningEn}</span>
            </span>
            <button
              className="names-play-btn"
              onClick={() => speak(n.arabic)}
              disabled={!supported}
              aria-label={`Écouter ${n.transliteration}`}
            >
              🔊
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
