import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const LOCAL_STORAGE_KEY = "waxtubi:fasting:log";

function dateKey(hijriYear, hijriMonth, hijriDay) {
  return `${hijriYear}-${String(hijriMonth).padStart(2, "0")}-${String(hijriDay).padStart(2, "0")}`;
}

function loadLocalLog() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalLog(log) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(log));
}

/**
 * Marque ou démarque un jour comme jeûné. Stocké en local toujours
 * (fonctionne même sans compte), et synchronisé vers Firestore en
 * plus si un utilisateur réel est connecté.
 */
export function toggleFastingDay(hijriYear, hijriMonth, hijriDay) {
  const key = dateKey(hijriYear, hijriMonth, hijriDay);
  const log = loadLocalLog();
  log[key] = !log[key];
  saveLocalLog(log);
  return log[key];
}

export function isFastingDayMarked(hijriYear, hijriMonth, hijriDay) {
  const key = dateKey(hijriYear, hijriMonth, hijriDay);
  return Boolean(loadLocalLog()[key]);
}

export function getLocalFastingLog() {
  return loadLocalLog();
}

/**
 * Sauvegarde le journal complet vers Firestore (appelé après chaque
 * changement, si un compte réel existe).
 */
export async function syncFastingLogToCloud(uid) {
  const log = loadLocalLog();
  await setDoc(doc(db, "users", uid, "fasting", "log"), { entries: log, updatedAt: Date.now() });
}

/**
 * Récupère le journal depuis Firestore et le fusionne avec le journal
 * local (le cloud complète le local, sans effacer ce qui existe déjà
 * localement et n'aurait pas encore été synchronisé).
 */
export async function mergeFastingLogFromCloud(uid) {
  const snap = await getDoc(doc(db, "users", uid, "fasting", "log"));
  if (!snap.exists()) return loadLocalLog();
  const cloudEntries = snap.data().entries || {};
  const localLog = loadLocalLog();
  const merged = { ...cloudEntries, ...localLog };
  saveLocalLog(merged);
  return merged;
}
