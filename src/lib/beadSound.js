// Génère le son d'une "perle" de tasbih qui s'entrechoque, sans fichier
// audio à charger : un clic court synthétisé via Web Audio API.
// Deux variantes : "soft" (discret) et "rich" (plus présent/tactile).

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Joue un clic synthétique imitant deux perles de bois/bois précieux
 * qui s'entrechoquent.
 * @param {"soft"|"rich"} variant
 * @param {number} volume - 0 à 1
 */
export function playBeadClick(variant = "soft", volume = 0.6) {
  const ctx = getAudioContext();
  if (!ctx || volume <= 0) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  if (variant === "soft") {
    // Clic bref et sec — un seul impact court, filtré pour rester discret
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.05);
  } else {
    // "rich" — double impact (perle qui touche puis rebondit légèrement),
    // plus de corps grâce à un second oscillateur plus grave.
    [
      { delay: 0, freq: 1800, gain: 0.55, dur: 0.05 },
      { delay: 0.018, freq: 900, gain: 0.35, dur: 0.07 },
    ].forEach(({ delay, freq, gain: g, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + delay + dur);

      filter.type = "bandpass";
      filter.frequency.value = freq * 0.9;
      filter.Q.value = 1.8;

      gain.gain.setValueAtTime(g, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.01);
    });
  }
}
