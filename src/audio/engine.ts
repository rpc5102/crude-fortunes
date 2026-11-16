/*
 * Shared audio graph: music + effects -> bus -> dry + reverb.
 * Created lazily on the first user gesture (autoplay rules). On iOS the
 * silent switch can still mute Web Audio; nothing to do about that here.
 */

export interface Engine {
  ac: AudioContext;
  /** Music gain (faded in/out and ducked). */
  master: GainNode;
  /** Sound-effects gain. */
  fx: GainNode;
  /** Half a second of white noise, reused by effects. */
  noise: AudioBuffer;
}

let engine: Engine | null = null;

export const current = (): Engine | null => engine;

function reverb(ac: AudioContext): ConvolverNode {
  const len = ac.sampleRate * 2.4, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const cv = ac.createConvolver(); cv.buffer = buf; return cv;
}

/** Creates the graph if needed and resumes the context. Null when audio is unavailable. */
export function ensure(): Engine | null {
  try {
    if (!engine) {
      const ac = new (window.AudioContext || window.webkitAudioContext!)();
      const bus = ac.createGain();
      const master = ac.createGain(); master.gain.value = 0; master.connect(bus);
      const fx = ac.createGain(); fx.gain.value = 0.9; fx.connect(bus);
      const dry = ac.createGain(), wet = ac.createGain(), rv = reverb(ac);
      dry.gain.value = 0.8; wet.gain.value = 0.35;
      bus.connect(dry).connect(ac.destination);
      bus.connect(rv).connect(wet).connect(ac.destination);
      const len = ac.sampleRate * 0.5;
      const noise = ac.createBuffer(1, len, ac.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      engine = { ac, master, fx, noise };
    }
    void engine.ac.resume();
    return engine;
  } catch {
    return null;
  }
}
