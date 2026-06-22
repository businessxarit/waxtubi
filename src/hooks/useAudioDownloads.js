import { useState, useCallback, useEffect } from "react";
import {
  downloadSurahAudio,
  isSurahDownloaded,
  listDownloadedSurahs,
  deleteSurahAudio,
  deleteAllSurahsForReciter,
} from "../lib/audioDownloads";
import { getSurahAudioUrl } from "../lib/quran";

export function useAudioDownloads(reciterIdentifier) {
  const [downloadedSet, setDownloadedSet] = useState(new Set());
  const [progress, setProgress] = useState({}); // { [surahNumber]: { received, total } }
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkCancelled, setBulkCancelled] = useState(false);
  const [error, setError] = useState(null);

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

  const downloadOne = useCallback(
    async (surahNumber) => {
      if (!reciterIdentifier) return;
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
    [reciterIdentifier, refreshDownloadedList]
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
   */
  const downloadAll = useCallback(async () => {
    if (!reciterIdentifier) return;
    setBulkRunning(true);
    setBulkCancelled(false);
    setError(null);

    for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
      if (bulkCancelled) break;
      const already = await isSurahDownloaded(reciterIdentifier, surahNumber);
      if (already) continue;
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
      } catch {
        setError(`Échec sur la sourate ${surahNumber}, arrêt du téléchargement groupé.`);
        break;
      }
    }

    setBulkRunning(false);
  }, [reciterIdentifier, bulkCancelled, refreshDownloadedList]);

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
    downloadOne,
    removeOne,
    downloadAll,
    cancelBulkDownload,
    removeAll,
  };
}
