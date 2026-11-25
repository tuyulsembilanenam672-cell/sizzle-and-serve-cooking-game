// Sizzle & Serve — sound: everything is synthesized with WebAudio.
// No audio files, no network. Created lazily on the first user gesture
// (browsers block audio before interaction).

let ctx = null;
let master = null;
let muted = false;
let sizzleNodes = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}
export function unlockAudio() { ensureCtx(); }

// A short tone with an exponential decay envelope.
function tone(freq, dur, type = 'sine', vol = 0.2, when = 0, slideTo = null) {
  const c = ensureCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Filtered noise burst: the "sizzle" / "splash" texture.
function noiseBurst(dur, filterFreq, vol = 0.25, when = 0) {
  const c = ensureCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = filterFreq;
  filt.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t0);
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.15); },
  place() { tone(440, 0.07, 'triangle', 0.18); noiseBurst(0.08, 2400, 0.1); },
  grillOn() { noiseBurst(0.35, 3200, 0.3); tone(180, 0.2, 'sawtooth', 0.06, 0, 90); },
  potOn() { noiseBurst(0.3, 900, 0.22); tone(300, 0.15, 'sine', 0.12, 0, 520); },
  ready() { tone(880, 0.09, 'sine', 0.18); tone(1318, 0.12, 'sine', 0.16, 0.09); },
  serve() {
    tone(523, 0.1, 'triangle', 0.2);
    tone(659, 0.1, 'triangle', 0.2, 0.09);
    tone(784, 0.16, 'triangle', 0.22, 0.18);
    noiseBurst(0.2, 5000, 0.08, 0.05);
  },
  error() { tone(220, 0.16, 'square', 0.1, 0, 160); tone(180, 0.2, 'square', 0.08, 0.1, 120); },
  expire() { tone(392, 0.2, 'sawtooth', 0.1, 0, 196); tone(311, 0.3, 'sawtooth', 0.1, 0.18, 155); },
  burnt() { noiseBurst(0.5, 500, 0.28); tone(140, 0.4, 'sawtooth', 0.1, 0, 70); },
  tick() { tone(1200, 0.04, 'square', 0.06); },
  start() {
    tone(392, 0.1, 'triangle', 0.2);
    tone(523, 0.1, 'triangle', 0.2, 0.1);
    tone(659, 0.18, 'triangle', 0.22, 0.2);
  },
  end() {
    tone(523, 0.14, 'triangle', 0.2);
    tone(659, 0.14, 'triangle', 0.2, 0.13);
    tone(784, 0.14, 'triangle', 0.2, 0.26);
    tone(1046, 0.3, 'triangle', 0.22, 0.39);
  },
};

// ---- continuous grill sizzle: a looping noise bed whose gain follows
// how many items are cooking. Start/stop it as the grill state changes.
export function setSizzle(activeCount) {
  const c = ensureCtx();
  if (!c) return;
  if (activeCount > 0 && !sizzleNodes) {
    const len = c.sampleRate * 1;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 3600;
    filt.Q.value = 0.6;
    const g = c.createGain();
    g.gain.value = 0;
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    src.start();
    sizzleNodes = { src, g };
  }
  if (sizzleNodes) {
    const target = muted ? 0 : Math.min(0.12, 0.045 * activeCount);
    sizzleNodes.g.gain.setTargetAtTime(target, c.currentTime, 0.2);
    if (activeCount === 0) {
      const nodes = sizzleNodes;
      sizzleNodes = null;
      setTimeout(() => { try { nodes.src.stop(); } catch (e) { /* already stopped */ } }, 600);
    }
  }
}

// ---- tiny background groove: a soft bass + pad loop, all synthesized.
// Kept deliberately quiet; it starts after the first user gesture.
let grooveTimer = null;
let grooveStep = 0;
const BASS_LINE = [130.8, 0, 98, 0, 110, 0, 146.8, 0, 130.8, 0, 98, 0, 164.8, 146.8, 110, 98];

export function startGroove() {
  if (grooveTimer) return;
  const c = ensureCtx();
  if (!c) return;
  grooveTimer = setInterval(() => {
    if (muted || !ctx) return;
    const f = BASS_LINE[grooveStep % BASS_LINE.length];
    grooveStep++;
    if (f) tone(f, 0.32, 'triangle', 0.07);
    if (grooveStep % 8 === 0) tone(261.6, 0.5, 'sine', 0.03);
    if (grooveStep % 8 === 4) tone(329.6, 0.5, 'sine', 0.03);
  }, 260);
}

export function stopGroove() {
  if (grooveTimer) { clearInterval(grooveTimer); grooveTimer = null; }
}
