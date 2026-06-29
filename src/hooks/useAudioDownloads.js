import { useState, useCallback, useEffect } from "react";
import {
  downloadSurahAudio,
  isSurahDownloaded,
  listDownloadedSurahs,
  deleteSurahAudio,
  deleteAllSurahsForReciter,
} from "../lib/audioDownloads";
import { getSurahAudioUrl } from "../lib/quran";

// Limite de téléchargements hors-ligne en version gratuite — au-delà,
// il faut Premium pour continuer. Le streaming reste illimité dans
// tous les cas, seul le stockage hors-ligne est limité.
export const FREE_DOWNLOAD_LIMIT = 10;

export function useAudioDownloads(reciterIdentifier, isPremium = false) {
  const [downloadedSet, setDownloadedSet] = useState(new Set());
  const [progress, setProgress] = useState({}); // { [surahNumber]: { received, total } }
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkCancelled, setBulkCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [limitReachedNotice, setLimitReachedNotice] = useState(false);

  const refreshDownloadedList = useCallback(async () => {
    if (!reciterIdentifier) return;
    try {
      const list = await listDownloadedSurahs(reciterIdentifier);
      setDownloadedSet(new Set(list.map((d) => d.surahNumber)));
    } catch {
      // IndexedDB indisponible (mode privé strict, etc.) — l'app continue
      // de fonctionner en streaming, juste sans persistance hors-ligne.
    }
  }, [reciterIdentifier]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!reciterIdentifier) return;
      try {
        const list = await listDownloadedSurahs(reciterIdentifier);
        if (!cancelled) setDownloadedSet(new Set(list.map((d) => d.surahNumber)));
      } catch {
        // IndexedDB indisponible (mode privé strict, etc.) — l'app continue
        // de fonctionner en streaming, juste sans persistance hors-ligne.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reciterIdentifier]);

  const hasReachedFreeLimit = !isPremium && downloadedSet.size >= FREE_DOWNLOAD_LIMIT;

  const downloadOne = useCallback(
    async (surahNumber) => {
      if (!reciterIdentifier) return;
      if (!isPremium && downloadedSet.size >= FREE_DOWNLOAD_LIMIT && !downloadedSet.has(surahNumber)) {
        setLimitReachedNotice(true);
        return;
      }
      setError(null);
      try {
        const url = getSurahAudioUrl(surahNumber, reciterIdentifier);
        await downloadSurahAudio(url, reciterIdentifier, surahNumber, (received, total) => {
          setProgress((p) => ({ ...p, [surahNumber]: { received, total } }));
        });
        setProgress((p) => {
          const next = { ...p };
          delete next[surahNumber];
          return next;
        });
        await refreshDownloadedList();
      } catch (e) {
        setError(`Téléchargement de la sourate ${surahNumber} échoué : ${e.message}`);
      }
    },
    [reciterIdentifier, refreshDownloadedList, isPremium, downloadedSet]
  );

  const removeOne = useCallback(
    async (surahNumber) => {
      if (!reciterIdentifier) return;
      await deleteSurahAudio(reciterIdentifier, surahNumber);
      await refreshDownloadedList();
    },
    [reciterIdentifier, refreshDownloadedList]
  );

  /**
   * Télécharge toutes les sourates (1 à 114) séquentiellement,
   * pour ne pas saturer la connexion ni la mémoire. Peut être annulé.
   * S'arrête automatiquement à la limite gratuite si pas Premium.
   */
  const downloadAll = useCallback(async () => {
    if (!reciterIdentifier) return;
    setBulkRunning(true);
    setBulkCancelled(false);
    setError(null);
    setLimitReachedNotice(false);

    for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
      if (bulkCancelled) break;
      const already = await isSurahDownloaded(reciterIdentifier, surahNumber);
      if (already) continue;

      const currentCount = (await listDownloadedSurahs(reciterIdentifier)).length;
      if (!isPremium && currentCount >= FREE_DOWNLOAD_LIMIT) {
        setLimitReachedNotice(true);
        break;
      }

      try {
        const url = getSurahAudioUrl(surahNumber, reciterIdentifier);
        await downloadSurahAudio(url, reciterIdentifier, surahNumber, (received, total) => {
          setProgress((p) => ({ ...p, [surahNumber]: { received, total } }));
        });
        setProgress((p) => {
          const next = { ...p };
          delete next[surahNumber];
          return next;
        });
        await refreshDownloadedList();
      } catch (e) {
        setError(`Échec sur la sourate ${surahNumber} : ${e.message}. Téléchargement groupé arrêté.`);
        break;
      }
    }

    setBulkRunning(false);
  }, [reciterIdentifier, bulkCancelled, refreshDownloadedList, isPremium]);

  const cancelBulkDownload = useCallback(() => setBulkCancelled(true), []);

  const removeAll = useCallback(async () => {
    if (!reciterIdentifier) return;
    await deleteAllSurahsForReciter(reciterIdentifier);
    await refreshDownloadedList();
  }, [reciterIdentifier, refreshDownloadedList]);

  return {
    downloadedSet,
    progress,
    bulkRunning,
    error,
    hasReachedFreeLimit,
    limitReachedNotice,
    dismissLimitNotice: () => setLimitReachedNotice(false),
    downloadOne,
    removeOne,
    downloadAll,
    cancelBulkDownload,
    removeAll,
  };
}
