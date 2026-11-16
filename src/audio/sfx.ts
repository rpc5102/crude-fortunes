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

// slot machine: no win. A video-slot "you lose": four falling chip notes and a sagging last one
function slotLose(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.02;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400; lp.connect(fx);
  ([[880, 0, 0.11], [740, 0.13, 0.11], [587, 0.26, 0.11], [440, 0.39, 0.5]] as const).forEach(([f, dt, dur]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "square"; o.frequency.setValueAtTime(f, t + dt);
    if (dur > 0.3) o.frequency.exponentialRampToValueAtTime(f * 0.86, t + dt + dur);
    g.gain.setValueAtTime(0.0001, t + dt); g.gain.exponentialRampToValueAtTime(0.09, t + dt + 0.01);
    g.gain.setValueAtTime(0.09, t + dt + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + dur);
    o.connect(g).connect(lp); o.start(t + dt); o.stop(t + dt + dur + 0.02);
  });
}

/** A receipt printer: a dot-matrix chatter per line over the paper feed's whirr. */
export function printerSound(lines: number, step: number): void {
  const e = ensure();
  if (!e) return;
  const { ac, fx, noise } = e;
  const t = ac.currentTime + 0.02, dur = lines * step;
  for (let i = 0; i < lines; i++) {
    for (let k = 0; k < 4; k++) noiseHit(e, t + i * step + k * 0.018, { freq: 2600 + Math.random() * 900, q: 3, dur: 0.012, vol: 0.32 });
  }
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noise; src.loop = true; bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 1.5;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.05);
  g.gain.setValueAtTime(0.07, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
  src.connect(bp).connect(g).connect(fx); src.start(t); src.stop(t + dur + 0.15);
}

/** Controls the slot-machine reel sound started by startReelSound(). */
export interface ReelSound {
  /** Reel `i` has stopped; `left` reels are still spinning. */
  stopReel(i: number, left: number): void;
  /** Cut everything off (the round was interrupted). */
  end(): void;
}

/** Lever pull, then the reels' mechanical whir and clatter, which thins out as reels stop. */
export function startReelSound(reelCount: number): ReelSound | null {
  const e = ensure();
  if (!e) return null;
  const { ac, fx, noise } = e;
  const t = ac.currentTime + 0.02;
  // lever pull: a ratchet that speeds up, then the lever bottoming out
  [0, 0.07, 0.13, 0.18, 0.22, 0.25].forEach((dt) => noiseHit(e, t + dt, { freq: 2600, q: 5, dur: 0.02, vol: 0.55 }));
  tone(e, t + 0.3, { f0: 130, f1: 60, dur: 0.16, vol: 0.55 });
  noiseHit(e, t + 0.3, { freq: 420, q: 0.8, dur: 0.1, vol: 0.5, type: "lowpass" });
  // reels: band-passed noise chopped by a square LFO, a clattery "brrrrr"
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), chop = ac.createGain(), lfo = ac.createOscillator(), depth = ac.createGain(), env = ac.createGain();
  src.buffer = noise; src.loop = true;
  bp.type = "bandpass"; bp.frequency.value = 1300; bp.Q.value = 0.9;
  chop.gain.value = 0.55; lfo.type = "square"; lfo.frequency.value = 15; depth.gain.value = 0.45; lfo.connect(depth).connect(chop.gain);
  const full = 0.4;
  env.gain.setValueAtTime(0.0001, t + 0.3); env.gain.exponentialRampToValueAtTime(full, t + 0.45);
  src.connect(bp).connect(chop).connect(env).connect(fx);
  src.start(t + 0.3); lfo.start(t + 0.3);
  let stopped = false;
  const stopAll = (at: number): void => {
    if (stopped) return;
    stopped = true;
    env.gain.cancelScheduledValues(at); env.gain.setTargetAtTime(0.0001, at, 0.04);
    src.stop(at + 0.3); lfo.stop(at + 0.3);
  };
  // the stop bell climbs reel by reel: C6 D6 E6 G6 A6 C7
  const BELLS = [1047, 1175, 1319, 1568, 1760, 2093];
  return {
    stopReel(i, left) {
      const now = ac.currentTime + 0.005;
      tone(e, now, { f0: 170, f1: 70, dur: 0.12, vol: 0.5 });                       // ka-
      noiseHit(e, now, { freq: 2000, q: 1.2, dur: 0.04, vol: 0.6 });                // -chunk
      const f = BELLS[i % BELLS.length]!;
      tone(e, now + 0.01, { f0: f, dur: 0.55, vol: 0.13 });                         // ding
      tone(e, now + 0.01, { f0: f * 2.76, dur: 0.2, vol: 0.04 });
      if (left <= 0) stopAll(now);
      else { env.gain.cancelScheduledValues(now); env.gain.setTargetAtTime(full * (0.35 + 0.65 * left / reelCount), now, 0.05); }
    },
    end() { stopAll(ac.currentTime); },
  };
}

// golden cookie: a heavenly "aah" choir chord (C major, detuned voices through vowel formants)
function choir(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.03, len = 3.4;
  const voices = ac.createGain(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), body = ac.createBiquadFilter(), env = ac.createGain();
  f1.type = "bandpass"; f1.frequency.value = 800; f1.Q.value = 4;     // "ah" formants
  f2.type = "bandpass"; f2.frequency.value = 1150; f2.Q.value = 5;
  body.type = "lowpass"; body.frequency.value = 1400;
  const bodyGain = ac.createGain(); bodyGain.gain.value = 0.25;
  voices.connect(f1).connect(env); voices.connect(f2).connect(env); voices.connect(body).connect(bodyGain).connect(env);
  env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(2, t + 0.45);
  env.gain.setValueAtTime(2, t + len - 1.3); env.gain.exponentialRampToValueAtTime(0.0001, t + len);
  env.connect(fx);
  [48, 60, 64, 67, 72, 76].forEach((m, i) => {
    const f = 440 * Math.pow(2, (m - 69) / 12);
    [-9, 0, 8].forEach((cents, j) => {
      const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
      o.type = "sawtooth"; o.frequency.value = f; o.detune.value = cents;
      lfo.frequency.value = 4.7 + 0.13 * (i * 3 + j) % 0.9; lg.gain.value = f * 0.006; lfo.connect(lg).connect(o.frequency);
      g.gain.value = m === 48 ? 0.05 : 0.035;
      o.connect(g).connect(voices);
      [o, lfo].forEach((n) => { n.start(t); n.stop(t + len + 0.05); });
    });
  });
  duckFor(e, t, len);
}

// a rubber stamp slammed down: a body thump, the rubber slap, a rattle of the desk
function stamp(e: Engine): void {
  const t = e.ac.currentTime + 0.005;
  tone(e, t, { f0: 120, f1: 45, dur: 0.2, vol: 0.75 });
  noiseHit(e, t, { freq: 900, q: 0.7, dur: 0.09, vol: 1, type: "lowpass" });
  noiseHit(e, t + 0.004, { freq: 3200, q: 1.2, dur: 0.03, vol: 0.55 });
  noiseHit(e, t + 0.06, { freq: 1600, q: 3, dur: 0.05, vol: 0.2 });
}

// the fart: a lowpassed buzz whose pitch wanders around 90 Hz, chopped ~30 times a second
// by a flapping valve (this is how it works, sorry), rising at the very end
function fart(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.02, dur = 1.3;
  const n = 52, pitch = new Float32Array(n);
  let f = 95;
  for (let i = 0; i < n; i++) {
    f = Math.min(135, Math.max(58, f + (Math.random() - 0.5) * 24));
    const tail = (i - n * 0.8) / (n * 0.2);
    pitch[i] = tail > 0 ? f * (1 + tail * 0.7) : f;
  }
  const o = ac.createOscillator(), o2 = ac.createOscillator();
  o.type = "sawtooth"; o2.type = "square";
  o.frequency.setValueCurveAtTime(pitch, t, dur);
  o2.frequency.setValueCurveAtTime(pitch.map((v) => v * 1.012), t, dur);
  const m = Math.round(dur * 62), chop = new Float32Array(m);
  for (let i = 0; i < m; i++) chop[i] = i % 2 ? 0.2 + Math.random() * 0.25 : 0.75 + Math.random() * 0.25;
  const flutter = ac.createGain(); flutter.gain.setValueCurveAtTime(chop, t, dur);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 3;
  lp.frequency.setValueAtTime(760, t); lp.frequency.linearRampToValueAtTime(430, t + dur * 0.8); lp.frequency.linearRampToValueAtTime(900, t + dur);
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(0.6, t + 0.04);
  env.gain.setValueAtTime(0.6, t + dur * 0.72); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const g2 = ac.createGain(); g2.gain.value = 0.35;
  o.connect(lp); o2.connect(g2).connect(lp);
  lp.connect(flutter).connect(env).connect(fx);
  [o, o2].forEach((x) => { x.start(t); x.stop(t + dur + 0.05); });
  noiseHit(e, t, { freq: 320, q: 0.8, dur: 0.45, vol: 0.3, type: "lowpass" });          // air
  noiseHit(e, t + dur - 0.12, { freq: 700, q: 1.5, dur: 0.12, vol: 0.35 });               // the final pfft
}

// blowing a raspberry: a buzzy low tone chopped by flapping lips, plus breath
function raspberry(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.01, dur = 0.5;
  const o = ac.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(78, t); o.frequency.linearRampToValueAtTime(62, t + dur);
  const m = Math.round(dur * 76), chop = new Float32Array(m);
  for (let i = 0; i < m; i++) chop[i] = i % 2 ? 0.08 + Math.random() * 0.1 : 0.85 + Math.random() * 0.15;
  const flap = ac.createGain(); flap.gain.setValueCurveAtTime(chop, t, dur);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 750; bp.Q.value = 0.8;
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(1, t + 0.02);
  env.gain.setValueAtTime(1, t + dur - 0.12); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(bp).connect(flap).connect(env).connect(fx);
  o.start(t); o.stop(t + dur + 0.02);
  noiseHit(e, t, { freq: 1600, q: 0.9, dur: 0.4, vol: 0.3 });
}

// swallowing: a quick falling bloop
function gulp(e: Engine): void {
  const t = e.ac.currentTime + 0.01;
  tone(e, t, { f0: 320, f1: 115, dur: 0.16, vol: 0.5 });
  tone(e, t + 0.02, { f0: 640, f1: 230, dur: 0.1, vol: 0.12 });
}

// a big rattly burp: a sawtooth through an open "aw" vowel, the throat rattling ~35/s
function burp(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.02, dur = 0.85;
  const o = ac.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(108, t); o.frequency.linearRampToValueAtTime(128, t + 0.15); o.frequency.linearRampToValueAtTime(80, t + dur);
  const m = Math.round(dur * 70), fry = new Float32Array(m);
  for (let i = 0; i < m; i++) fry[i] = i % 2 ? 0.25 + Math.random() * 0.35 : 1;
  const rattle = ac.createGain(); rattle.gain.setValueCurveAtTime(fry, t, dur);
  const f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), body = ac.createBiquadFilter(), bodyGain = ac.createGain();
  f1.type = "bandpass"; f1.frequency.value = 620; f1.Q.value = 3.5;
  f2.type = "bandpass"; f2.frequency.value = 1050; f2.Q.value = 4.5;
  body.type = "lowpass"; body.frequency.value = 900; bodyGain.gain.value = 0.35;
  o.connect(f1).connect(rattle); o.connect(f2).connect(rattle); o.connect(body).connect(bodyGain).connect(rattle);
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(0.8, t + 0.05);
  env.gain.setValueAtTime(0.8, t + dur - 0.25); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  rattle.connect(env).connect(fx);
  o.start(t); o.stop(t + dur + 0.02);
}

// a computer having a breakdown: a square wave jumping between random pitches, cutting in
// and out, with bursts of filtered noise
function glitch(e: Engine): void {
  const { ac, fx } = e;
  const t = ac.currentTime + 0.01, dur = 0.9;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = "square";
  for (let x = 0; x < dur; x += 0.03) {
    o.frequency.setValueAtTime(80 + Math.random() * 1800, t + x);
    g.gain.setValueAtTime(Math.random() < 0.3 ? 0 : 0.1 + Math.random() * 0.08, t + x);
  }
  g.gain.setValueAtTime(0, t + dur);
  o.connect(g).connect(fx); o.start(t); o.stop(t + dur + 0.02);
  for (let x = 0; x < dur; x += 0.09) noiseHit(e, t + x, { freq: 400 + Math.random() * 5000, q: 6, dur: 0.03, vol: 0.4 });
}

// a generic error chime: two falling notes
function errorChime(e: Engine): void {
  const t = e.ac.currentTime + 0.01;
  tone(e, t, { f0: 880, dur: 0.18, vol: 0.2, type: "triangle" });
  tone(e, t + 0.16, { f0: 587, dur: 0.4, vol: 0.2, type: "triangle" });
}

const SFX = { crack, snap, sparkle, doom, breathe, buzz, womp, crunch, crumple, believe, abduct, rec, windup, slotLose, choir, stamp, fart, raspberry, gulp, burp, glitch, errorChime };
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
