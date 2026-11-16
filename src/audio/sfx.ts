/* Synthesized sound effects. All go through the fx gain. */
import { current, ensure, type Engine } from "./engine";
import { duckForDoom } from "./music";

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
  duckForDoom(e, t, len);
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

const SFX = { crack, snap, sparkle, doom, breathe, buzz, womp, crunch, crumple };
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
