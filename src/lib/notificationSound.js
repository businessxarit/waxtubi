// Signaux sonores pour les notifications de prière — générés en Web
// Audio API (synthétisés), pas des enregistrements audio externes.
//
// Note honnête : ce ne sont PAS des enregistrements du véritable Adhan
// (l'appel à la prière chanté) — on n'a pas trouvé de source audio
// fiable et vérifiée à héberger pour ça. Ce sont des signaux sonores
// distinctifs et agréables qui annoncent l'heure de la prière, sur le
// même principe que le son des perles du compteur Dhikr déjà en place.

let notifAudioCtx = null;
function getNotifAudioContext() {
  if (typeof window === "undefined") return null;
  if (!notifAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    notifAudioCtx = new Ctx();
  }
  if (notifAudioCtx.state === "suspended") notifAudioCtx.resume();
  return notifAudioCtx;
}

function playTone(ctx, { freq, start, duration, gain, type = "sine" }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export const NOTIFICATION_TONES = [
  { id: "chime", label: "Carillon doux" },
  { id: "bell", label: "Cloche claire" },
  { id: "rising", label: "Montée harmonieuse" },
];

export function playNotificationTone(toneId = "chime", volume = 0.7) {
  const ctx = getNotifAudioContext();
  if (!ctx || volume <= 0) return;
  const now = ctx.currentTime;

  if (toneId === "bell") {
    playTone(ctx, { freq: 880, start: now, duration: 1.2, gain: volume * 0.5, type: "sine" });
    playTone(ctx, { freq: 1320, start: now + 0.02, duration: 1.0, gain: volume * 0.3, type: "sine" });
  } else if (toneId === "rising") {
    [523, 659, 784].forEach((freq, i) => {
      playTone(ctx, { freq, start: now + i * 0.18, duration: 0.5, gain: volume * 0.45, type: "triangle" });
    });
  } else {
    // "chime" par défaut : deux notes douces
    playTone(ctx, { freq: 660, start: now, duration: 0.6, gain: volume * 0.5, type: "sine" });
    playTone(ctx, { freq: 880, start: now + 0.22, duration: 0.7, gain: volume * 0.5, type: "sine" });
  }
}
