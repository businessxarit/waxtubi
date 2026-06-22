import { useState, useEffect } from "react";

// Dakar, Sénégal — position de repli si la géoloc est refusée ou indisponible
const DAKAR_FALLBACK = {
  lat: 14.6928,
  lng: -17.4467,
  city: "Dakar",
  isFallback: true,
};

const HAS_GEOLOCATION = typeof navigator !== "undefined" && "geolocation" in navigator;

export function useGeolocation() {
  // Si l'API n'existe pas, on connaît le résultat dès le rendu initial :
  // pas besoin d'un effet qui déclenche un setState juste après le montage.
  const [position, setPosition] = useState(HAS_GEOLOCATION ? null : DAKAR_FALLBACK);
  const [status, setStatus] = useState(HAS_GEOLOCATION ? "loading" : "unsupported");

  useEffect(() => {
    if (!HAS_GEOLOCATION) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          city: null, // résolu plus tard si besoin via reverse geocoding
          isFallback: false,
        });
        setStatus("granted");
      },
      () => {
        if (cancelled) return;
        setPosition(DAKAR_FALLBACK);
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { position, status };
}
