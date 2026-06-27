import { useState, useEffect, useCallback, useRef } from "react";
import { playNotificationTone } from "../lib/notificationSound";

const STORAGE_KEY = "waxtubi:notifications:enabled";
const TONE_STORAGE_KEY = "waxtubi:notifications:tone";
const NOTIFIED_KEY_PREFIX = "waxtubi:notified:";

const NOTIFICATIONS_SUPPORTED = typeof window !== "undefined" && "Notification" in window;

/**
 * Planifie et déclenche des notifications locales au moment de chaque
 * prière. Limite honnête : ceci n'est PAS un vrai push serveur — ça ne
 * fonctionne que si l'app/onglet reste ouvert (ou l'a été récemment et
 * que le navigateur garde le service worker actif). Sur iOS, nécessite
 * que la PWA soit installée sur l'écran d'accueil.
 *
 * Le son joué au moment de la notification est un signal synthétisé
 * (pas un enregistrement du véritable Adhan) — la plupart des
 * navigateurs/OS ignorent de toute façon le son personnalisé des
 * notifications web, donc on joue ce signal nous-mêmes côté app tant
 * qu'elle est ouverte.
 */
export function usePrayerNotifications(timings) {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [tone, setTone] = useState(
    () => localStorage.getItem(TONE_STORAGE_KEY) || "chime"
  );
  const [permission, setPermission] = useState(
    NOTIFICATIONS_SUPPORTED ? Notification.permission : "unsupported"
  );
  const timeoutsRef = useRef([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(TONE_STORAGE_KEY, tone);
  }, [tone]);

  const requestPermission = useCallback(async () => {
    if (!NOTIFICATIONS_SUPPORTED) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") setEnabled(true);
    return result === "granted";
  }, []);

  // Planifie une notification pour chaque prière du jour qui n'est pas
  // encore passée — annule les anciennes planifications avant.
  useEffect(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (!enabled || !timings || permission !== "granted") return;

    const todayKey = new Date().toDateString();
    const now = new Date();

    Object.values(timings).forEach((prayer) => {
      if (prayer.key === "Sunrise") return; // pas une prière
      const [h, m] = prayer.time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0, 0);

      const delay = prayerTime.getTime() - now.getTime();
      if (delay <= 0) return; // déjà passé aujourd'hui

      const notifiedKey = `${NOTIFIED_KEY_PREFIX}${todayKey}:${prayer.key}`;
      if (localStorage.getItem(notifiedKey)) return; // déjà notifié

      const timeoutId = setTimeout(() => {
        try {
          new Notification(`${prayer.label} — Waxtubi`, {
            body: `C'est l'heure de la prière de ${prayer.label}.`,
            icon: "/icon-192.png",
            tag: `prayer-${prayer.key}`,
          });
          playNotificationTone(tone);
          localStorage.setItem(notifiedKey, "1");
        } catch {
          // Échec silencieux (navigateur ayant révoqué la permission entre temps, etc.)
        }
      }, delay);

      timeoutsRef.current.push(timeoutId);
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [enabled, timings, permission, tone]);

  const setEnabledSafely = useCallback(
    (next) => {
      if (next && permission !== "granted") {
        requestPermission();
      } else {
        setEnabled(next);
      }
    },
    [permission, requestPermission]
  );

  return {
    supported: NOTIFICATIONS_SUPPORTED,
    permission,
    enabled: enabled && permission === "granted",
    setEnabled: setEnabledSafely,
    tone,
    setTone,
  };
}
