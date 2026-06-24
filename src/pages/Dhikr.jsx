import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import PrayerBeads from "../components/PrayerBeads";
import AccountPanel from "../components/AccountPanel";
import Duas from "./Duas";
import Stats from "./Stats";
import { useBeadSound } from "../hooks/useBeadSound";
import { useSpeech } from "../hooks/useSpeech";
import { useAuth } from "../hooks/useAuth";
import { fetchDhikrCount, saveDhikrCount } from "../lib/dhikrSync";
import { fetchAsmaAlHusna } from "../lib/asmaAlHusna";
import { recordDhikrToday } from "../lib/personalStats";
import { StatsIcon, TargetIcon, DuaIcon, BeadsCircleIcon, AccountIcon, SoundIcon } from "../components/DhikrIcons";
import "./Dhikr.css";

const CYCLE_LENGTH = 33; // cycle traditionnel du tasbih, utilisé tant qu'aucun objectif n'est fixé
const SAVE_DEBOUNCE_MS = 1500;
const GOAL_STORAGE_KEY = "waxtubi:dhikr:goal";

export default function Dhikr() {
  const { user, loading: authLoading } = useAuth();
  const [count, setCount] = useState(0);
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showNamesPanel, setShowNamesPanel] = useState(false);
  const [showDuas, setShowDuas] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGoalPanel, setShowGoalPanel] = useState(false);
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem(GOAL_STORAGE_KEY);
    return saved ? Number(saved) : null;
  });
  const [goalInput, setGoalInput] = useState("");
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

  useEffect(() => {
    if (goal) localStorage.setItem(GOAL_STORAGE_KEY, String(goal));
    else localStorage.removeItem(GOAL_STORAGE_KEY);
  }, [goal]);

  const reachedGoal = Boolean(goal) && count >= goal;

  const increment = useCallback(() => {
    // Une fois l'objectif atteint, le compteur s'arrête : les touches
    // supplémentaires ne font plus rien (pas de son ni d'incrément).
    if (goal && count >= goal) return;
    setCount((c) => c + 1);
    recordDhikrToday(1);
    play();
  }, [play, goal, count]);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  function applyGoal() {
    const n = parseInt(goalInput, 10);
    if (Number.isFinite(n) && n > 0) {
      setGoal(n);
      setCount(0);
      setGoalInput("");
      setShowGoalPanel(false);
    }
  }

  function clearGoal() {
    setGoal(null);
    setShowGoalPanel(false);
  }

  const completedCycles = goal ? null : Math.floor(count / CYCLE_LENGTH);
  const progress = goal ? Math.min(1, count / goal) : (count % CYCLE_LENGTH) / CYCLE_LENGTH;
  const hasRealAccount = user && !user.isAnonymous;

  function togglePanel(panel) {
    setShowAccountPanel(panel === "account" ? (s) => !s : false);
    setShowSoundPanel(panel === "sound" ? (s) => !s : false);
    setShowNamesPanel(panel === "names" ? (s) => !s : false);
    setShowDuas(panel === "duas" ? (s) => !s : false);
    setShowGoalPanel(panel === "goal" ? (s) => !s : false);
  }

  if (showDuas) {
    return <Duas onBack={() => setShowDuas(false)} />;
  }

  if (showStats) {
    return <Stats onBack={() => setShowStats(false)} />;
  }

  return (
    <div className="dhikr-page">
      <header className="dhikr-header">
        <span className="home-eyebrow">Dhikr</span>
        <h1 className="dhikr-title">Compteur</h1>
        <div className="dhikr-header-actions">
          <button className="dhikr-icon-btn" onClick={() => setShowStats(true)} aria-label="Mes statistiques">
            <StatsIcon />
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("goal")} aria-label="Définir un objectif">
            <TargetIcon active={showGoalPanel} />
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("duas")} aria-label="Duas du quotidien">
            <DuaIcon active={showDuas} />
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("names")} aria-label="Les 99 Noms d'Allah">
            <BeadsCircleIcon active={showNamesPanel} />
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("account")} aria-label="Compte">
            <AccountIcon active={showAccountPanel} hasRealAccount={hasRealAccount} />
          </button>
          <button className="dhikr-icon-btn" onClick={() => togglePanel("sound")} aria-label="Réglages du son">
            <SoundIcon active={showSoundPanel} enabled={prefs.enabled} />
          </button>
        </div>
      </header>

      {showGoalPanel && (
        <div className="goal-panel">
          <p className="goal-panel-text">
            Fixe un objectif (ex. 1111, 313, 99) — le compteur s'arrêtera
            automatiquement une fois atteint.
          </p>
          <div className="goal-panel-row">
            <input
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="Ex. 1111"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyGoal();
              }}
              className="goal-input"
            />
            <button className="goal-apply-btn" onClick={applyGoal}>
              Définir
            </button>
          </div>
          {goal && (
            <button className="goal-clear-btn" onClick={clearGoal}>
              Retirer l'objectif (revenir au cycle de 33)
            </button>
          )}
        </div>
      )}

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
              {goal
                ? reachedGoal
                  ? "🎯 Objectif atteint !"
                  : `Objectif : ${goal}`
                : completedCycles > 0
                  ? `${completedCycles} tour${completedCycles > 1 ? "s" : ""} complet${completedCycles > 1 ? "s" : ""}`
                  : "Glisse ou touche les perles"}
            </span>
          </div>

          <PrayerBeads
            count={count}
            cycleLength={goal ?? CYCLE_LENGTH}
            onIncrement={increment}
            disabled={reachedGoal}
            progress={progress}
          />

          {reachedGoal && (
            <p className="goal-reached-note">
              Le compteur s'est arrêté à {goal}. Touche « Réinitialiser » pour recommencer.
            </p>
          )}

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
