/* Background music: a plucked zither-style tune on a pentatonic scale, made in the browser. */
import { current, ensure, type Engine } from "./engine";

const BEAT = 60 / 76;                                   // tempo
const hz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
// D pentatonic phrases: [midi note, beats]
const PHRASES: [number, number][][] = [
  [[74,.5],[76,.5],[78,1],[76,.5],[74,.5],[71,1],[69,1],[71,.5],[74,.5],[69,2]],
  [[66,.5],[69,.5],[71,1],[74,1],[71,.5],[69,.5],[66,1],[64,1],[62,2]],
  [[81,1],[78,.5],[76,.5],[74,1],[76,.5],[78,.5],[81,1.5],[78,.5],[76,2]],
  [[74,.5],[71,.5],[69,1],[66,.5],[69,.5],[71,1],[69,.5],[66,.5],[64,1],[62,2]]
];
const BASS: [number, number][] = [[50,45],[47,50],[45,47],[45,50]];   // two bass notes per phrase

type Note = { at: number; n: number; d: number } | { at: number; bass: number };
const melody: Note[] = [];
PHRASES.forEach((ph, i) => {
  let t = 0;
  ph.forEach(([n, d]) => { melody.push({ n, d, at: i * 8 + t }); t += d; });
  melody.push({ bass: BASS[i]![0], at: i * 8 }, { bass: BASS[i]![1], at: i * 8 + 4 });
});
melody.sort((a, b) => a.at - b.at);
const LOOP = 32;

let timer = 0, nextTime = 0, step = 0, playing = false;

function pluck({ ac, master }: Engine, midi: number, t: number, dur: number, vol = 0.22): void {
  const f = hz(midi), long = dur >= 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.9, dur * BEAT * 1.6));
  const lp = ac.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(f * 7, t); lp.frequency.exponentialRampToValueAtTime(f * 2, t + 0.5);
  ([[1, "triangle", 1], [2, "sine", 0.35], [3, "sine", 0.12]] as const).forEach(([mult, type, amt]) => {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = type; og.gain.value = amt;
    // long notes slide up into pitch and wobble, like a bent zither string
    if (long) { o.frequency.setValueAtTime(f * mult * 0.94, t); o.frequency.exponentialRampToValueAtTime(f * mult, t + 0.09); }
    else o.frequency.setValueAtTime(f * mult, t);
    if (long) {
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * mult * 0.012, t + 0.4);
      lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + dur * BEAT + 1.5);
    }
    o.connect(og).connect(lp); o.start(t); o.stop(t + dur * BEAT + 1.6);
  });
  lp.connect(g).connect(master);
}

function bass({ ac, master }: Engine, midi: number, t: number): void {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = "sine"; o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 3.8);
  o.connect(g).connect(master); o.start(t); o.stop(t + BEAT * 4);
}

function schedule(): void {
  const e = current()!;
  while (nextTime < e.ac.currentTime + 0.6) {
    const ev = melody[step % melody.length]!;
    const t = nextTime;
    if ("bass" in ev) bass(e, ev.bass, t); else pluck(e, ev.n, t, ev.d);
    step++;
    const nxt = melody[step % melody.length]!;
    const nAt = nxt.at + (step % melody.length === 0 ? LOOP : 0);
    nextTime += (nAt - ev.at) * BEAT;
  }
}

export const isPlaying = (): boolean => playing;

export function startMusic(): void {
  if (playing) return;
  try {
    const e = ensure();
    if (!e) return;
    const { ac, master } = e;
    nextTime = Math.max(nextTime, ac.currentTime + 0.15);
    if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.1;
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setTargetAtTime(0.55, ac.currentTime, 0.8);
    timer = window.setInterval(schedule, 120); schedule();
    playing = true;
  } catch { /* no audio available */ }
}

export function stopMusic(): void {
  if (!playing) return;
  const { ac, master } = current()!;
  playing = false; clearInterval(timer);
  master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
  setTimeout(() => { if (!playing) void ac.suspend(); }, 900);
}

/** Lower the music under the phone call, or bring it back. */
export function duckMusic(on: boolean): void {
  const e = current();
  if (!e || !playing) return;
  const { ac, master } = e;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setTargetAtTime(on ? 0.05 : 0.55, ac.currentTime, on ? 0.2 : 1);
}

/** Duck the music under an effect (the Council's drone, the believe jingle) for `len` seconds from `t`. */
export function duckFor({ master }: Engine, t: number, len: number): void {
  if (!playing) return;
  master.gain.cancelScheduledValues(t);
  master.gain.setTargetAtTime(0.04, t, 0.3);
  master.gain.setTargetAtTime(0.55, t + len, 1.2);
}
