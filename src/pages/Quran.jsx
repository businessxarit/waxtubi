import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fetchSurahList, fetchSurah, fetchAvailableReciters, getSurahAudioUrl, searchQuran, TRANSLATION_LANGUAGES } from "../lib/quran";
import { useAudioDownloads, FREE_DOWNLOAD_LIMIT } from "../hooks/useAudioDownloads";
import { useArabicFont } from "../hooks/useArabicFont";
import { useAyahByAyahPlayback } from "../hooks/useAyahByAyahPlayback";
import { getDownloadedSurahUrl } from "../lib/audioDownloads";
import { useShare } from "../hooks/useShare";
import { usePremium } from "../hooks/usePremium";
import { transliterateArabic } from "../lib/transliteration";
import ReciterAvatar from "../components/ReciterAvatar";
import OrnamentalBorder from "../components/OrnamentalBorder";
import Premium from "./Premium";
import "./Quran.css";

const LANG_STORAGE_KEY = "waxtubi:quran:lang";
const RECITER_STORAGE_KEY = "waxtubi:quran:reciter";
const SEARCH_DEBOUNCE_MS = 500;

export default function Quran() {
  const [surahList, setSurahList] = useState(null);
  const [listError, setListError] = useState(null);
  const [activeSurahNumber, setActiveSurahNumber] = useState(null);
  const [search, setSearch] = useState("");
  const [contentQuery, setContentQuery] = useState("");
  const [contentResults, setContentResults] = useState(null);
  const [contentSearchError, setContentSearchError] = useState(null);
  const [resolvedQueryKey, setResolvedQueryKey] = useState(null);
  const [lang, setLang] = useState(
    () => localStorage.getItem(LANG_STORAGE_KEY) || "fr"
  );
  const [reciters, setReciters] = useState(null);
  const [recitersError, setRecitersError] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState(
    () => localStorage.getItem(RECITER_STORAGE_KEY) || null
  );
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    fetchSurahList()
      .then(setSurahList)
      .catch((e) => setListError(e.message));
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    fetchAvailableReciters()
      .then((list) => {
        setReciters(list);
        setSelectedReciter((current) =>
          current && list.some((r) => r.identifier === current) ? current : list[0]?.identifier ?? null
        );
      })
      .catch((e) => setRecitersError(e.message));
  }, []);

  // Recherche par contenu (mot-clé dans le texte), distincte du filtre
  // par nom de sourate. Debounce pour éviter un appel à chaque frappe.
  // "loading" est dérivé (clé de requête résolue ≠ clé courante) plutôt
  // que mis à jour directement dans l'effet.
  const currentQueryKey = `${contentQuery.trim()}:${lang}`;
  const contentSearchLoading =
    contentQuery.trim().length >= 2 && resolvedQueryKey !== currentQueryKey && !contentSearchError;

  useEffect(() => {
    if (!contentQuery || contentQuery.trim().length < 2) return;

    const queryKey = `${contentQuery.trim()}:${lang}`;
    const timeoutId = setTimeout(() => {
      searchQuran(contentQuery, lang)
        .then((results) => {
          setContentResults(results);
          setContentSearchError(null);
        })
        .catch((e) => setContentSearchError(e.message))
        .finally(() => setResolvedQueryKey(queryKey));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [contentQuery, lang]);

  useEffect(() => {
    if (selectedReciter) localStorage.setItem(RECITER_STORAGE_KEY, selectedReciter);
  }, [selectedReciter]);

  const { isPremium } = usePremium();
  const downloads = useAudioDownloads(selectedReciter, isPremium);
  const currentReciterLabel = reciters?.find((r) => r.identifier === selectedReciter)?.label;
  const arabicFont = useArabicFont();
  const [showFontPanel, setShowFontPanel] = useState(false);

  const filteredList = useMemo(() => {
    if (!surahList) return [];
    const q = search.trim().toLowerCase();
    if (!q) return surahList;
    return surahList.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [surahList, search]);

  if (showPremium) {
    return <Premium onBack={() => setShowPremium(false)} />;
  }

  if (activeSurahNumber) {
    return (
      <SurahReader
        surahNumber={activeSurahNumber}
        lang={lang}
        onChangeLang={setLang}
        onBack={() => setActiveSurahNumber(null)}
        reciters={reciters}
        recitersError={recitersError}
        selectedReciter={selectedReciter}
        onChangeReciter={setSelectedReciter}
        downloads={downloads}
      />
    );
  }

  return (
    <div className="quran-page">
      <header className="quran-header">
        <span className="home-eyebrow">Coran</span>
        <h1 className="quran-title">114 sourates</h1>
        <div className="quran-header-actions">
          <button className="quran-font-toggle" onClick={() => setShowFontPanel((s) => !s)}>
            ✒ Style d'écriture
          </button>
        </div>
        {showFontPanel && (
          <div className="font-panel">
            {arabicFont.options.map((f) => (
              <button
                key={f.id}
                className={`font-option ${arabicFont.fontId === f.id ? "is-active" : ""}`}
                onClick={() => arabicFont.setFont(f.id)}
              >
                <span className="font-option-preview" style={{ fontFamily: f.fontFamily }} lang="ar" dir="rtl">
                  بِسْمِ اللَّهِ
                </span>
                <span className="font-option-label">{f.label}</span>
                <span className="font-option-sublabel">{f.sublabel}</span>
              </button>
            ))}
          </div>
        )}
        <input
          className="quran-search"
          type="text"
          inputMode="search"
          placeholder="Rechercher une sourate ou un numéro…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          className="quran-content-search"
          type="text"
          inputMode="search"
          placeholder="🔍 Rechercher un mot dans le texte du Coran…"
          value={contentQuery}
          onChange={(e) => setContentQuery(e.target.value)}
        />
      </header>

      {contentQuery.trim().length >= 2 && (
        <section className="content-search-results">
          {contentSearchLoading && <p className="quran-status">Recherche…</p>}
          {contentSearchError && <p className="quran-status quran-error">{contentSearchError}</p>}
          {contentResults && contentResults.length === 0 && !contentSearchLoading && (
            <p className="quran-status">Aucun verset ne contient « {contentQuery} ».</p>
          )}
          {contentResults && contentResults.length > 0 && (
            <ul className="content-result-list">
              {contentResults.map((r) => (
                <li key={r.globalNumber}>
                  <button
                    className="content-result-row"
                    onClick={() => {
                      setActiveSurahNumber(r.surahNumber);
                      setContentQuery("");
                    }}
                  >
                    <span className="content-result-ref">{r.surahName} · {r.ayahNumber}</span>
                    <span className="content-result-text">{r.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {reciters && reciters.length > 0 && (
        <div className="download-bar">
          <button className="download-bar-toggle" onClick={() => setShowDownloadPanel((s) => !s)}>
            ⬇ Écoute hors-ligne
          </button>
          {showDownloadPanel && (
            <div className="download-panel">
              <p className="download-panel-text">
                Télécharge le Coran complet pour l'écouter sans connexion, avec{" "}
                <strong>{currentReciterLabel}</strong> (changeable dans une sourate).
              </p>
              <p className="download-panel-size">
                {downloads.downloadedSet.size} / 114 sourates téléchargées
                {!isPremium && ` (limite gratuite : ${FREE_DOWNLOAD_LIMIT})`}
              </p>

              {!downloads.bulkRunning ? (
                <button className="download-panel-btn" onClick={downloads.downloadAll} disabled={downloads.hasReachedFreeLimit}>
                  Tout télécharger (≈ 350-500 Mo)
                </button>
              ) : (
                <button className="download-panel-btn download-panel-btn-cancel" onClick={downloads.cancelBulkDownload}>
                  Annuler le téléchargement
                </button>
              )}

              {downloads.downloadedSet.size > 0 && !downloads.bulkRunning && (
                <button className="download-panel-btn-text" onClick={downloads.removeAll}>
                  Supprimer tous les téléchargements
                </button>
              )}

              {downloads.limitReachedNotice && !isPremium && (
                <p className="download-limit-notice">
                  Limite gratuite de {FREE_DOWNLOAD_LIMIT} sourates hors-ligne atteinte.{" "}
                  <button onClick={() => setShowPremium(true)}>Passer à Premium →</button> pour un téléchargement illimité.
                </p>
              )}

              {downloads.error && <p className="quran-status quran-error">{downloads.error}</p>}
            </div>
          )}
        </div>
      )}

      {listError && <p className="quran-status quran-error">{listError}</p>}
      {!surahList && !listError && (
        <p className="quran-status">Chargement des sourates…</p>
      )}

      {contentQuery.trim().length < 2 && (
        <ul className="surah-list">
          {filteredList.map((s) => {
            const isDownloaded = downloads.downloadedSet.has(s.number);
            const progress = downloads.progress[s.number];
            return (
              <li key={s.number}>
                <button
                  className="surah-row"
                  onClick={() => setActiveSurahNumber(s.number)}
                >
                  <span className="surah-number">{s.number}</span>
                  <span className="surah-names">
                    <span className="surah-english">{s.englishName}</span>
                    <span className="surah-translation">{s.englishNameTranslation}</span>
                  </span>
                  {progress && (
                    <span className="surah-download-progress">
                      {Math.round((progress.received / (progress.total || progress.received || 1)) * 100)}%
                    </span>
                  )}
                  {!progress && isDownloaded && <span className="surah-downloaded-badge">⬇</span>}
                  <span className="surah-arabic" lang="ar" dir="rtl">{s.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {surahList && filteredList.length === 0 && (
        <p className="quran-status">Aucune sourate ne correspond à « {search} ».</p>
      )}
    </div>
  );
}

function SurahReader({
  surahNumber,
  lang,
  onChangeLang,
  onBack,
  reciters,
  recitersError,
  selectedReciter,
  onChangeReciter,
  downloads,
}) {
  const [surah, setSurah] = useState(null);
  const [error, setError] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingKey, setPlayingKey] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [audioErrorKey, setAudioErrorKey] = useState(null);
  const [localAudioUrl, setLocalAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const playbackKey = `${surahNumber}:${selectedReciter}`;
  const isCurrentlyPlaying = isPlaying && playingKey === playbackKey;
  const isDownloaded = downloads.downloadedSet.has(surahNumber);
  const downloadProgress = downloads.progress[surahNumber];
  const [karaokeMode, setKaraokeMode] = useState(false);
  const { share } = useShare();
  const karaoke = useAyahByAyahPlayback(surah?.ayahs, selectedReciter);
  const [viewMode, setViewMode] = useState("list"); // "list" | "mushaf"
  const [mushafPageState, setMushafPageState] = useState({ surahNumber: null, index: 0 });

  // Découpage en "pages" pour le mode Mushaf — un regroupement indicatif
  // par lots de versets pour l'affichage, PAS la pagination éditoriale
  // officielle d'un Coran imprimé (qui suit ses propres règles de mise
  // en page et n'est pas reproduite ici).
  const AYAHS_PER_PAGE = 8;
  const mushafPages = useMemo(() => {
    if (!surah) return [];
    const pages = [];
    for (let i = 0; i < surah.ayahs.length; i += AYAHS_PER_PAGE) {
      pages.push(surah.ayahs.slice(i, i + AYAHS_PER_PAGE));
    }
    return pages;
  }, [surah]);

  // La page revient à 0 dès qu'on change de sourate : dérivé directement
  // plutôt que réinitialisé via setState dans un effet.
  const mushafPageIndex = mushafPageState.surahNumber === surahNumber ? mushafPageState.index : 0;
  const setMushafPageIndex = useCallback(
    (index) => setMushafPageState({ surahNumber, index }),
    [surahNumber]
  );

  const requestKey = `${surahNumber}:${lang}`;
  const loading = requestKey !== loadedKey && !error;

  useEffect(() => {
    let cancelled = false;
    fetchSurah(surahNumber, lang)
      .then((data) => {
        if (cancelled) return;
        setSurah(data);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber, lang]);

  // Cherche un fichier audio déjà téléchargé localement pour ce couple
  // sourate/récitateur — priorité absolue sur le streaming si présent.
  useEffect(() => {
    if (!selectedReciter || !isDownloaded) return;

    let cancelled = false;
    let createdUrl = null;

    getDownloadedSurahUrl(selectedReciter, surahNumber).then((url) => {
      if (cancelled) return;
      createdUrl = url;
      setLocalAudioUrl(url);
    });
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [selectedReciter, surahNumber, isDownloaded]);

  // Quand on quitte l'état "téléchargé" (suppression, changement de
  // récitateur), l'URL locale précédente n'est plus valide : on la
  // dérive directement au rendu plutôt que de la réinitialiser dans
  // un effet séparé.
  const activeLocalAudioUrl = isDownloaded ? localAudioUrl : null;

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isCurrentlyPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setAudioError("Lecture audio impossible pour le moment."));
    }
  }, [isCurrentlyPlaying]);

  const streamingUrl = selectedReciter ? getSurahAudioUrl(surahNumber, selectedReciter) : null;
  const audioUrl = activeLocalAudioUrl || streamingUrl;
  const currentReciterLabel = reciters?.find((r) => r.identifier === selectedReciter)?.label;
  const displayedAudioError = audioErrorKey === playbackKey ? audioError : null;

  return (
    <div className="reader-page">
      <header className="reader-header">
        <button className="reader-back" onClick={onBack} aria-label="Retour à la liste des sourates">
          ← Sourates
        </button>
        <div className="reader-lang-switch" role="group" aria-label="Langue de traduction">
          {TRANSLATION_LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${lang === l.code ? "is-active" : ""}`}
              onClick={() => onChangeLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {recitersError && <p className="quran-status quran-error">{recitersError}</p>}

      {reciters && reciters.length > 0 && (
        <>
          <div className="reciter-avatar-row">
            {reciters.map((r) => (
              <button
                key={r.identifier}
                className={`reciter-avatar-btn ${selectedReciter === r.identifier ? "is-selected" : ""}`}
                onClick={() => onChangeReciter(r.identifier)}
                aria-label={r.label}
                aria-pressed={selectedReciter === r.identifier}
              >
                <ReciterAvatar label={r.label} selected={selectedReciter === r.identifier} />
                <span className="reciter-avatar-name">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="reciter-bar">
            <button className="reciter-play-btn" onClick={togglePlayback} disabled={!audioUrl} aria-label={isCurrentlyPlaying ? "Pause" : "Lecture"}>
              {isCurrentlyPlaying ? "⏸" : "▶"}
            </button>
            <span className="reciter-bar-label">{currentReciterLabel}</span>

            {downloadProgress ? (
              <span className="reciter-download-progress">
                {Math.round((downloadProgress.received / (downloadProgress.total || downloadProgress.received || 1)) * 100)}%
              </span>
            ) : isDownloaded ? (
              <button
                className="reciter-download-btn is-downloaded"
                onClick={() => downloads.removeOne(surahNumber)}
                aria-label="Supprimer le téléchargement"
                title="Téléchargée — toucher pour supprimer"
              >
                ⬇✓
              </button>
            ) : (
              <button
                className="reciter-download-btn"
                onClick={() => downloads.downloadOne(surahNumber)}
                aria-label="Télécharger pour écoute hors-ligne"
                title="Télécharger pour écoute hors-ligne"
              >
                ⬇
              </button>
            )}

            {audioUrl && (
              <audio
                key={playbackKey + (activeLocalAudioUrl ? ":local" : ":stream")}
                ref={audioRef}
                src={audioUrl}
                onPlay={() => { setIsPlaying(true); setPlayingKey(playbackKey); }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                  setAudioError(`Audio indisponible pour ${currentReciterLabel ?? "ce récitateur"} sur cette sourate.`);
                  setAudioErrorKey(playbackKey);
                }}
              />
            )}
          </div>
        </>
      )}

      {reciters && reciters.length > 0 && (
        <button
          className={`karaoke-toggle ${karaokeMode ? "is-active" : ""}`}
          onClick={() => {
            if (karaokeMode) karaoke.stop();
            audioRef.current?.pause();
            setKaraokeMode((m) => !m);
          }}
        >
          {karaokeMode ? "✓ Lecture verset par verset activée" : "📖 Activer la lecture verset par verset"}
        </button>
      )}

      {karaokeMode && (
        <div className="karaoke-controls">
          <button
            className="karaoke-play-btn"
            onClick={() => (karaoke.isPlaying ? karaoke.pause() : karaoke.play())}
          >
            {karaoke.isPlaying ? "⏸ Pause" : karaoke.activeIndex !== null ? "▶ Reprendre" : "▶ Démarrer depuis le verset 1"}
          </button>
          {karaoke.activeIndex !== null && (
            <span className="karaoke-position">Verset {karaoke.activeIndex + 1} / {surah?.ayahs.length}</span>
          )}
        </div>
      )}

      {karaokeMode && karaoke.error && <p className="quran-status quran-error">{karaoke.error}</p>}
      {isDownloaded && <p className="quran-offline-note">📥 Disponible hors-ligne</p>}
      {displayedAudioError && <p className="quran-status quran-error">{displayedAudioError}</p>}

      {surah && (
        <div className="view-mode-switch" role="group" aria-label="Mode d'affichage">
          <button className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")}>
            Liste
          </button>
          <button className={viewMode === "mushaf" ? "is-active" : ""} onClick={() => setViewMode("mushaf")}>
            Mushaf
          </button>
        </div>
      )}

      {loading && <p className="quran-status">Chargement…</p>}
      {error && <p className="quran-status quran-error">{error}</p>}

      {surah && (
        <>
          <div className="surah-title-block">
            <span className="surah-arabic-title" lang="ar" dir="rtl">{surah.name}</span>
            <h1 className="surah-title">{surah.englishName}</h1>
            <p className="surah-subtitle">
              {surah.englishNameTranslation} · {surah.revelationType === "Meccan" ? "Mecquoise" : "Médinoise"} · {surah.ayahs.length} versets
            </p>
          </div>

          {viewMode === "list" && (
            <ol className="ayah-list">
              {surah.ayahs.map((a, i) => {
                const isActiveAyah = karaokeMode && karaoke.activeIndex === i;
                return (
                  <li
                    key={a.globalNumber}
                    className={`ayah-row ${isActiveAyah ? "is-active-ayah" : ""} ${karaokeMode ? "is-clickable" : ""}`}
                    onClick={karaokeMode ? () => karaoke.playAyah(i) : undefined}
                  >
                    <div className="ayah-row-top">
                      <span className="ayah-number">{a.number}</span>
                      <button
                        className="ayah-share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          share({
                            title: `${surah.englishName} — verset ${a.number}`,
                            text: `${a.arabic}\n\n${a.translation}\n\n— ${surah.englishName} (${surah.number}:${a.number}), via Waxtubi`,
                          });
                        }}
                        aria-label="Partager ce verset"
                      >
                        ↗
                      </button>
                    </div>
                    <p className="ayah-arabic" lang="ar" dir="rtl">{a.arabic}</p>
                    <p className="ayah-translit">{transliterateArabic(a.arabic)}</p>
                    <p className="ayah-translation">{a.translation}</p>
                  </li>
                );
              })}
            </ol>
          )}

          {viewMode === "mushaf" && (
            <MushafView
              pages={mushafPages}
              pageIndex={mushafPageIndex}
              onChangePage={setMushafPageIndex}
              surahName={surah.name}
              surahNumber={surah.number}
              karaokeMode={karaokeMode}
              activeGlobalAyah={karaokeMode && karaoke.activeIndex !== null ? surah.ayahs[karaoke.activeIndex]?.globalNumber : null}
              onAyahClick={
                karaokeMode
                  ? (globalNumber) => {
                      const idx = surah.ayahs.findIndex((a) => a.globalNumber === globalNumber);
                      if (idx !== -1) karaoke.playAyah(idx);
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function MushafView({ pages, pageIndex, onChangePage, surahName, surahNumber, karaokeMode, activeGlobalAyah, onAyahClick }) {
  const page = pages[pageIndex] ?? [];
  const totalPages = pages.length;

  return (
    <div className="mushaf-view">
      <OrnamentalBorder height={28} />
      <div className="mushaf-page">
        <div className="mushaf-cartouche">
          <span lang="ar" dir="rtl">{surahName}</span>
        </div>
        <p className="mushaf-text" lang="ar" dir="rtl">
          {page.map((a) => (
            <span
              key={a.globalNumber}
              className={`mushaf-ayah-inline ${karaokeMode && activeGlobalAyah === a.globalNumber ? "is-active-ayah-inline" : ""} ${karaokeMode ? "is-clickable" : ""}`}
              onClick={onAyahClick ? () => onAyahClick(a.globalNumber) : undefined}
            >
              {a.arabic}
              <span className="mushaf-ayah-marker">{`۝${a.number}`}</span>{" "}
            </span>
          ))}
        </p>
        <span className="mushaf-page-number">
          Sourate {surahNumber} · Page {pageIndex + 1} / {totalPages}
        </span>
      </div>
      <OrnamentalBorder height={28} />

      <div className="mushaf-pagination">
        <button onClick={() => onChangePage(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0}>
          ← Page précédente
        </button>
        <button onClick={() => onChangePage(Math.min(totalPages - 1, pageIndex + 1))} disabled={pageIndex >= totalPages - 1}>
          Page suivante →
        </button>
      </div>
      <p className="mushaf-note">
        Pagination indicative (regroupement par lots de versets), pas la mise en page officielle d'un Coran imprimé.
      </p>
    </div>
  );
}
