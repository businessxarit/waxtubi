import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const LOCAL_STORAGE_KEY = "waxtubi:prayers:log"; // { "2026-06-24": { Fajr: true, Dhuhr: true, ... } }

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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Marque ou démarque une prière comme accomplie pour aujourd'hui.
 * Stocké en local toujours ; synchronisé vers Firestore en plus si un
 * compte réel existe (appelé séparément par la page).
 */
export function togglePrayerDone(prayerKey) {
  const log = loadLocalLog();
  const key = todayKey();
  if (!log[key]) log[key] = {};
  log[key][prayerKey] = !log[key][prayerKey];
  saveLocalLog(log);
  return log[key][prayerKey];
}

export function getTodaysPrayerLog() {
  const log = loadLocalLog();
  return log[todayKey()] || {};
}

export async function syncPrayerLogToCloud(uid) {
  if (!isFirebaseConfigured) return;
  const log = loadLocalLog();
  await setDoc(doc(db, "users", uid, "prayers", "log"), { entries: log, updatedAt: Date.now() });
}

export async function mergePrayerLogFromCloud(uid) {
  if (!isFirebaseConfigured) return loadLocalLog()[todayKey()] || {};
  const snap = await getDoc(doc(db, "users", uid, "prayers", "log"));
  if (!snap.exists()) return loadLocalLog()[todayKey()] || {};
  const cloudEntries = snap.data().entries || {};
  const localLog = loadLocalLog();
  const merged = { ...cloudEntries, ...localLog };
  saveLocalLog(merged);
  return merged[todayKey()] || {};
}
