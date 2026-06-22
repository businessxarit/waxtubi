// Gestion des téléchargements audio du Coran pour écoute hors-ligne.
// Utilise IndexedDB plutôt que le Cache API : on a besoin de connaître
// la taille totale, de suivre une progression précise par chunk, et de
// pouvoir lister/supprimer des téléchargements individuellement — ce
// que l'API Cache ne permet pas facilement.

const DB_NAME = "waxtubi-audio";
const DB_VERSION = 1;
const STORE_NAME = "surah-audio";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // clé = "reciterIdentifier:surahNumber"
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function storageKey(reciterIdentifier, surahNumber) {
  return `${reciterIdentifier}:${surahNumber}`;
}

/**
 * Télécharge un fichier audio de sourate et le stocke en local.
 * @param {string} url
 * @param {string} reciterIdentifier
 * @param {number} surahNumber
 * @param {(receivedBytes: number, totalBytes: number) => void} onProgress
 */
export async function downloadSurahAudio(url, reciterIdentifier, surahNumber, onProgress) {
  let res;
  try {
    res = await fetch(url, { mode: "cors" });
  } catch {
    // Échec réseau pur (hors-ligne, ou requête bloquée avant même la
    // réponse — souvent un signe de restriction CORS côté serveur).
    throw new Error("Connexion au serveur audio impossible (réseau ou restriction d'accès)");
  }

  if (!res.ok) {
    throw new Error(`Le serveur audio a répondu une erreur (code ${res.status})`);
  }
  if (!res.body) {
    throw new Error("Réponse audio invalide (flux vide)");
  }

  const totalBytes = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    receivedBytes += value.length;
    onProgress?.(receivedBytes, totalBytes);
  }

  const blob = new Blob(chunks, { type: "audio/mpeg" });
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(
      { blob, sizeBytes: blob.size, downloadedAt: Date.now() },
      storageKey(reciterIdentifier, surahNumber)
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return blob.size;
}

/**
 * Récupère une URL locale (object URL) pour une sourate déjà téléchargée,
 * ou null si elle n'est pas en cache local.
 */
export async function getDownloadedSurahUrl(reciterIdentifier, surahNumber) {
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(storageKey(reciterIdentifier, surahNumber));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (!record) return null;
  return URL.createObjectURL(record.blob);
}

/**
 * Vérifie si une sourate est déjà téléchargée (sans charger le blob entier).
 */
export async function isSurahDownloaded(reciterIdentifier, surahNumber) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getKey(storageKey(reciterIdentifier, surahNumber));
    req.onsuccess = () => resolve(Boolean(req.result));
    req.onerror = () => reject(req.error);
  });
}

/**
 * Liste toutes les sourates téléchargées pour un récitateur donné,
 * avec leur taille — utile pour afficher l'espace utilisé.
 */
export async function listDownloadedSurahs(reciterIdentifier) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const results = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const [reciter, surahNumber] = String(cursor.key).split(":");
      if (reciter === reciterIdentifier) {
        results.push({ surahNumber: Number(surahNumber), sizeBytes: cursor.value.sizeBytes });
      }
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/**
 * Supprime une sourate téléchargée.
 */
export async function deleteSurahAudio(reciterIdentifier, surahNumber) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(storageKey(reciterIdentifier, surahNumber));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Supprime tous les téléchargements d'un récitateur (libère l'espace).
 */
export async function deleteAllSurahsForReciter(reciterIdentifier) {
  const downloaded = await listDownloadedSurahs(reciterIdentifier);
  for (const { surahNumber } of downloaded) {
    await deleteSurahAudio(reciterIdentifier, surahNumber);
  }
}

export function formatBytes(bytes) {
  if (!bytes) return "0 Mo";
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${Math.round(bytes / 1024)} Ko` : `${mb.toFixed(1)} Mo`;
}
