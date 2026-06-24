import { getLocalFastingLog } from "./fastingTracker";

const DHIKR_DAILY_LOG_KEY = "waxtubi:dhikr:dailyLog"; // { "2026-06-23": totalCeJourLa }

/**
 * Enregistre le nombre de dhikr fait aujourd'hui (cumulé), pour
 * permettre des statistiques par jour. Appelé à chaque incrément
 * depuis la page Dhikr.
 */
export function recordDhikrToday(incrementBy = 1) {
  const log = loadDhikrDailyLog();
  const todayKey = new Date().toISOString().slice(0, 10);
  log[todayKey] = (log[todayKey] || 0) + incrementBy;
  localStorage.setItem(DHIKR_DAILY_LOG_KEY, JSON.stringify(log));
}

function loadDhikrDailyLog() {
  try {
    const raw = localStorage.getItem(DHIKR_DAILY_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Calcule un résumé des statistiques personnelles à partir des
 * données stockées localement (jeûne + dhikr). Tout est dérivé des
 * journaux existants, rien n'est dupliqué ailleurs.
 */
export function computePersonalStats() {
  const fastingLog = getLocalFastingLog();
  const fastingDays = Object.values(fastingLog).filter(Boolean).length;

  const dhikrLog = loadDhikrDailyLog();
  const dhikrEntries = Object.entries(dhikrLog);
  const totalDhikr = dhikrEntries.reduce((sum, [, count]) => sum + count, 0);
  const activeDhikrDays = dhikrEntries.filter(([, count]) => count > 0).length;

  // Série de jours consécutifs de dhikr (streak), en partant d'aujourd'hui
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dhikrLog[key] && dhikrLog[key] > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    fastingDays,
    totalDhikr,
    activeDhikrDays,
    dhikrStreak: streak,
  };
}
