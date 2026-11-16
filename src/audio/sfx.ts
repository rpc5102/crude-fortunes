/* Synthesized sound effects. All go through the fx gain. */
import { current, ensure, type Engine } from "./engine";
import { duckFor } from "./music";

interface NoiseOpts { freq: number; q?: number; dur: number; vol: number; type?: BiquadFilterType }
function noiseHit({ ac, fx, noise }: Engine, t: number, { freq, q = 1, dur, vol, type = "bandpass" }: NoiseOpts): void {
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noise; src.playbackRate.value = 0.8 + Math.random() * 0.4;
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(fx);
  src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
}

interface ToneOpts { f0: number; f1?: number; dur: number; vol: number; type?: OscillatorType }
function tone({ ac, fx }: Engine, t: number, { f0, f1 = f0, dur, vol, type = "sine" }: ToneOpts): void {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(fx); o.start(t); o.stop(t + dur + 0.02);
}

// crunchy cookie snap: a low thump and a few crackles
function crack(e: Engine): void {
  const t = e.ac.currentTime + 0.01;
  tone(e, t, { f0: 140, f1: 55, dur: 0.12, vol: 0.5 });
  noiseHit(e, t, { freq: 2200, q: 0.9, dur: 0.07, vol: 0.9 });
  for (let i = 0; i < 5; i++) {
    noiseHit(e, t + 0.02 + Math.random() * 0.11, { freq: 1500 + Math.random() * 2800, q: 2, dur: 0.02 + Math.random() * 0.04, vol: 0.25 + Math.random() * 0.35 });
  }
}

// wooden chopsticks clacking apart
function snap(e: Engine): void {
  const t = e.ac.currentTime + 0.01;
  [0, 0.07].forEach((dt, i) => {
    noiseHit(e, t + dt, { freq: i ? 1100 : 1500, q: 7, dur: 0.05, vol: 0.9 });
    tone(e, t + dt, { f0: i ? 760 : 980, f1: i ? 700 : 900, dur: 0.06, vol: 0.28, type: "triangle" });
  });
}

// twinkly bell sparkles on a pentatonic scale
function sparkle(e: Engine): void {
  const t = e.ac.currentTime + 0.05;
  const notes = [86, 88, 90, 93, 95, 98, 100];
  for (let i = 0; i < 7; i++) {
    const at = t + i * 0.07 + Math.random() * 0.04, f = 440 * Math.pow(2, (notes[Math.floor(Math.random() * notes.length)]! - 69) / 12);
    const v = 0.09 * (1 - i / 9);
    tone(e, at, { f0: f, dur: 0.7, vol: v });
    tone(e, at, { f0: f * 1.003, dur: 0.6, vol: v * 0.6 });
    tone(e, at, { f0: f * 2.76, dur: 0.18, vol: v * 0.25 });
  }
}

// The Council: a sub boom, a dissonant drone that swells and fades, music ducked underneath
function doom(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.02, len = 7;
  tone(e, t, { f0: 70, f1: 28, dur: 2.6, vol: 0.9 });
  noiseHit(e, t, { freq: 160, q: 0.7, dur: 2, vol: 1.2, type: "lowpass" });
  const lp = ac.createBiquadFilter(), g = ac.createGain();
  lp.type = "lowpass"; lp.frequency.setValueAtTime(180, t); lp.frequency.linearRampToValueAtTime(520, t + 3); lp.frequency.linearRampToValueAtTime(150, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 1.8);
  g.gain.setValueAtTime(0.32, t + len - 2.5); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  lp.connect(g).connect(fx);
  [55, 55.4, 77.8, 116.5, 38.9].forEach((f) => {           // A, beating A, tritone, more dissonance, sub
    const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
    o.connect(lp); o.start(t); o.stop(t + len + 0.1);
  });
  duckFor(e, t, len);
}

// slow, wet breathing: filtered noise swelling in and out
function breathe({ ac, fx, noise }: Engine): void {
  const t = ac.currentTime + 0.05;
  for (let i = 0; i < 4; i++) {
    const at = t + i * 1.7, inhale = i % 2 === 0;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noise; src.loop = true;
    f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(inhale ? 700 : 1100, at); f.frequency.linearRampToValueAtTime(inhale ? 1200 : 600, at + 1.3);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(inhale ? 0.35 : 0.5, at + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.5);
    src.connect(f).connect(g).connect(fx); src.start(at); src.stop(at + 1.6);
  }
}

// angry buzzer for rage mode
function buzz(e: Engine): void {
  const t = e.ac.currentTime + 0.01;
  [92, 97].forEach((f) => tone(e, t, { f0: f, f1: f * 0.9, dur: 0.45, vol: 0.22, type: "square" }));
}

// sad trombone-ish "womp womp" for an empty cookie
function womp(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.25;
  ([[311, 294, 0, 0.42], [262, 220, 0.48, 1.1]] as const).forEach(([f0, f1, dt, dur]) => {
    const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(f0, t + dt); o.frequency.linearRampToValueAtTime(f1, t + dt + dur);
    lfo.frequency.value = 5; lg.gain.value = dur > 1 ? 6 : 0; lfo.connect(lg).connect(o.frequency);
    lp.type = "lowpass"; lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t + dt); g.gain.exponentialRampToValueAtTime(0.2, t + dt + 0.05);
    g.gain.setValueAtTime(0.2, t + dt + dur - 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + dur);
    o.connect(lp).connect(g).connect(fx); o.start(t + dt); o.stop(t + dt + dur + 0.05); lfo.start(t + dt); lfo.stop(t + dt + dur);
  });
  noiseHit(e, ac.currentTime + 0.02, { freq: 500, q: 0.6, dur: 0.5, vol: 0.5, type: "lowpass" });   // the poof
}

// small crunches while crushing
function crunch(e: Engine): void {
  const t = e.ac.currentTime + 0.005;
  for (let i = 0; i < 3; i++) noiseHit(e, t + Math.random() * 0.05, { freq: 1200 + Math.random() * 3000, q: 1.5, dur: 0.02 + Math.random() * 0.04, vol: 0.3 + Math.random() * 0.4 });
}

// paper being balled up
function crumple(e: Engine): void {
  const t = e.ac.currentTime + 0.02;
  for (let i = 0; i < 9; i++) noiseHit(e, t + i * 0.04 + Math.random() * 0.03, { freq: 3000 + Math.random() * 3000, q: 0.8, dur: 0.05 + Math.random() * 0.05, vol: 0.25 });
}

/* ----- "I want to believe": an original eerie sci-fi jingle on Chinese instruments ----- */
const midiHz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

// guzheng-style pluck: bright attack, quick darkening, long ring
function zither({ ac }: Engine, out: AudioNode, midi: number, t: number, vol: number): void {
  const f = midiHz(midi), g = ac.createGain(), lp = ac.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.setValueAtTime(f * 8, t); lp.frequency.exponentialRampToValueAtTime(f * 2, t + 0.4);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  ([[1, "triangle", 1], [2, "sine", 0.3], [3, "sine", 0.1]] as const).forEach(([mult, type, amt]) => {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = type; o.frequency.value = f * mult; og.gain.value = amt;
    o.connect(og).connect(lp); o.start(t); o.stop(t + 1.5);
  });
  lp.connect(g).connect(out);
}

// small opera gong: inharmonic partials with the classic upward pitch bend
function gong({ ac }: Engine, out: AudioNode, t: number): void {
  [[98, 0.5], [145, 0.3], [207, 0.2], [268, 0.12]].forEach(([f, v]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(f!, t); o.frequency.exponentialRampToValueAtTime(f! * 1.09, t + 0.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v!, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    o.connect(g).connect(out); o.start(t); o.stop(t + 3.3);
  });
}

// erhu-style bowed line: nasal sawtooth, slow bow attack, vibrato, sliding between notes
function erhu({ ac }: Engine, out: AudioNode, t: number, path: [number, number][], end: number, vol: number): void {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), bp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), g = ac.createGain();
  o.type = o2.type = "sawtooth"; o2.detune.value = 7;
  bp.type = "peaking"; bp.frequency.value = 1400; bp.Q.value = 1.2; bp.gain.value = 8;
  lp.type = "lowpass"; lp.frequency.value = 3200;
  const [[, m0]] = path as [[number, number]];
  [o, o2].forEach((osc) => {
    osc.frequency.setValueAtTime(midiHz(m0), t);
    path.forEach(([at, m]) => osc.frequency.exponentialRampToValueAtTime(midiHz(m), t + at));
  });
  const lfo = ac.createOscillator(), lg = ac.createGain();
  lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(midiHz(m0) * 0.018, t + 0.6);
  lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.18);
  g.gain.setValueAtTime(vol, t + end - 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + end);
  o.connect(bp); o2.connect(bp); bp.connect(lp).connect(g).connect(out);
  [o, o2, lfo].forEach((n) => { n.start(t); n.stop(t + end + 0.05); });
}

function believe(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.05, len = 6.5;
  // everything goes through a dark, long echo for that late-night broadcast feel
  const echo = ac.createDelay(1), fb = ac.createGain(), tone = ac.createBiquadFilter(), send = ac.createGain();
  echo.delayTime.value = 0.36; fb.gain.value = 0.42; tone.type = "lowpass"; tone.frequency.value = 1800; send.gain.value = 0.5;
  send.connect(echo).connect(tone).connect(fb).connect(echo); tone.connect(fx);
  const bus = ac.createGain(); bus.connect(fx); bus.connect(send);
  gong(e, bus, t);
  // repeating plucked figure in D minor, fading in then out
  const fig = [62, 69, 65, 69];
  for (let i = 0; i < 16; i++) zither(e, bus, fig[i % 4]!, t + 0.25 + i * 0.21, 0.07 + 0.05 * Math.sin((i / 15) * Math.PI));
  // the bowed line: up a fourth, climb to D, sink through a chromatic neighbour, slide away
  erhu(e, bus, t + 0.9, [[0, 67], [0.16, 69], [0.7, 69], [0.86, 74], [1.6, 74], [1.74, 72], [2.05, 69], [2.3, 68], [3.0, 68], [3.5, 64]], 3.9, 0.13);
  duckFor(e, t, len);
}

// the "I want to believe" cookie gets abducted: swoop in, tractor beam, zip away (~2.8s)
function abduct(e: Engine): void {
  const { ac, fx, noise } = e;
  const t = ac.currentTime + 0.02;
  // whoosh as the saucer swoops in
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noise; src.loop = true; f.type = "bandpass"; f.Q.value = 2;
  f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  src.connect(f).connect(g).connect(fx); src.start(t); src.stop(t + 0.75);
  // tractor beam: a pulsing low hum under an erhu sliding up and up
  const hum = ac.createOscillator(), trem = ac.createGain(), lfo = ac.createOscillator(), depth = ac.createGain(), env = ac.createGain();
  hum.type = "triangle"; hum.frequency.value = 110;
  trem.gain.value = 0.7; lfo.frequency.value = 9; depth.gain.value = 0.3; lfo.connect(depth).connect(trem.gain);
  env.gain.setValueAtTime(0.0001, t + 0.65); env.gain.exponentialRampToValueAtTime(0.12, t + 0.9);
  env.gain.setValueAtTime(0.12, t + 2.2); env.gain.exponentialRampToValueAtTime(0.0001, t + 2.45);
  hum.connect(trem).connect(env).connect(fx);
  [hum, lfo].forEach((n) => { n.start(t + 0.65); n.stop(t + 2.5); });
  erhu(e, fx, t + 0.8, [[0, 62], [1.5, 86]], 1.65, 0.07);
  // and it's gone
  tone(e, t + 2.35, { f0: 500, f1: 2600, dur: 0.3, vol: 0.14 });
}

// security camera starts recording: two short beeps
function rec(e: Engine): void {
  const t = e.ac.currentTime + 0.02;
  [0, 0.13].forEach((dt) => tone(e, t + dt, { f0: 1760, dur: 0.08, vol: 0.12 }));
}

// winding up a music box: a run of ratchet clicks
function windup(e: Engine): void {
  const t = e.ac.currentTime + 0.02;
  for (let i = 0; i < 10; i++) noiseHit(e, t + i * 0.075 + Math.random() * 0.01, { freq: 3800 + Math.random() * 800, q: 6, dur: 0.025, vol: 0.5 });
}

const SFX = { crack, snap, sparkle, doom, breathe, buzz, womp, crunch, crumple, believe, abduct, rec, windup };
export type SfxName = keyof typeof SFX;

export function playSfx(name: SfxName): void {
  const e = ensure();
  if (e) SFX[name](e);
}

// classic double ring (two mixed tones, ring-ring ... pause)
let ringTimer = 0;
function ringOnce(): void {
  const { ac, fx } = current()!;
  const t = ac.currentTime + 0.02;
  [0, 0.6].forEach((dt) => {
    [400, 450].forEach((f) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + dt); g.gain.exponentialRampToValueAtTime(0.12, t + dt + 0.02);
      g.gain.setValueAtTime(0.12, t + dt + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.45);
      o.connect(g).connect(fx); o.start(t + dt); o.stop(t + dt + 0.5);
    });
  });
}

/** Start or stop the phone ringing. */
export function ring(on: boolean): void {
  if (!(on ? ensure() : current())) return;
  clearInterval(ringTimer); ringTimer = 0;
  if (!on) return;
  ringOnce(); ringTimer = window.setInterval(ringOnce, 3000);
}
