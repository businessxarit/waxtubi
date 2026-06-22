const BASE = "https://api.aladhan.com/v1";

// Méthode 3 = Muslim World League, standard la plus utilisée
// en Afrique de l'Ouest francophone (Sénégal, Mali, etc.)
const DEFAULT_METHOD = 3;

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const PRAYER_LABELS_FR = {
  Fajr: "Fajr",
  Sunrise: "Chourouq",
  Dhuhr: "Dhouhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

/**
 * Récupère les horaires de prière du jour pour des coordonnées données.
 */
export async function fetchTimingsByCoords(lat, lng, date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const url = `${BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${DEFAULT_METHOD}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Impossible de récupérer les horaires de prière");
  const json = await res.json();
  return normalizeTimingsResponse(json.data);
}

function normalizeTimingsResponse(data) {
  const timings = {};
  for (const key of PRAYER_KEYS) {
    timings[key] = {
      key,
      label: PRAYER_LABELS_FR[key],
      time: data.timings[key].split(" ")[0], // enlève l'éventuelle timezone suffix
    };
  }
  return {
    timings,
    hijri: data.date.hijri,
    gregorian: data.date.gregorian,
    timezone: data.meta.timezone,
  };
}

/**
 * Détermine la prochaine prière et le temps restant, à partir
 * d'un objet timings (HH:MM) et de l'heure courante.
 */
export function getNextPrayer(timings, now = new Date()) {
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]; // sunrise exclu (pas une prière)
  const todayMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  for (const key of order) {
    const t = toMinutes(timings[key].time);
    if (t > todayMinutes) {
      return {
        current: timings[key],
        minutesUntil: t - todayMinutes,
        isTomorrow: false,
      };
    }
  }
  // Toutes les prières du jour sont passées → prochaine = Fajr de demain
  const fajrMinutes = toMinutes(timings.Fajr.time);
  return {
    current: timings.Fajr,
    minutesUntil: 24 * 60 - todayMinutes + fajrMinutes,
    isTomorrow: true,
  };
}

/**
 * Calcule la direction de la Qibla (en degrés depuis le Nord)
 * depuis des coordonnées données, vers la Kaaba à La Mecque.
 */
export function getQiblaDirection(lat, lng) {
  const kaabaLat = (21.4225 * Math.PI) / 180;
  const kaabaLng = (39.8262 * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;

  const Δλ = kaabaLng - λ1;
  const y = Math.sin(Δλ) * Math.cos(kaabaLat);
  const x =
    Math.cos(φ1) * Math.sin(kaabaLat) -
    Math.sin(φ1) * Math.cos(kaabaLat) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/**
 * Distance approximative (km) jusqu'à la Mecque — info contextuelle.
 */
export function getDistanceToMecca(lat, lng) {
  const R = 6371;
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const dLat = ((kaabaLat - lat) * Math.PI) / 180;
  const dLng = ((kaabaLng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((kaabaLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
