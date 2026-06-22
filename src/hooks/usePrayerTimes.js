import { useState, useEffect } from "react";
import { useGeolocation } from "./useGeolocation";
import { fetchTimingsByCoords, getNextPrayer } from "../lib/prayerTimes";

export function usePrayerTimes() {
  const { position, status: geoStatus } = useGeolocation();
  const [data, setData] = useState(null);
  const [next, setNext] = useState(null);
  const [error, setError] = useState(null);
  const [fetchedForKey, setFetchedForKey] = useState(null);

  const positionKey = position ? `${position.lat},${position.lng}` : null;
  const loading = Boolean(positionKey) && fetchedForKey !== positionKey && !error;

  // Charge les horaires dès qu'on a une position (et seulement si elle a changé)
  useEffect(() => {
    if (!position || !positionKey || positionKey === fetchedForKey) return;

    let cancelled = false;
    fetchTimingsByCoords(position.lat, position.lng)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
        setFetchedForKey(positionKey);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setFetchedForKey(positionKey);
      });

    return () => {
      cancelled = true;
    };
  }, [position, positionKey, fetchedForKey]);

  // Recalcule la prochaine prière chaque minute
  useEffect(() => {
    if (!data) return;
    const tick = () => setNext(getNextPrayer(data.timings));
    tick();
    const id = setInterval(tick, 30 * 1000);
    return () => clearInterval(id);
  }, [data]);

  return { position, geoStatus, data, next, error, loading };
}
