/*
 * "Don't look behind you.": the lights slowly go down, a heartbeat quickens, and a pair of
 * eyes opens in the dark and blinks at you. Then the lights come back.
 */
import { playSfx } from "../audio/sfx";
import { hint } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const dark = document.createElement("div");
dark.className = "lights-out";
dark.setAttribute("aria-hidden", "true");
const eyes = document.createElement("div");
eyes.className = "dark-eyes";
eyes.hidden = true;
eyes.setAttribute("aria-hidden", "true");
eyes.innerHTML = "<i></i><i></i>";
document.body.append(dark, eyes);

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };
const fade = (to: number, ms: number): void => {
  const from = Number(getComputedStyle(dark).opacity) || 0;
  dark.getAnimations().forEach((a) => a.cancel());
  dark.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "ease-in-out", fill: "forwards" });
};

registerGimmick({
  match: (f) => SPECIAL.behind.test(f),
  landed() {
    const reduced = reducedMotion();
    at(800, () => { fade(0.9, 2600); hint.textContent = "I said don't."; });
    // the heartbeat speeds up as it gets dark
    [900, 1950, 2900, 3750, 4500, 5150, 5700].forEach((ms) => at(ms, () => { if (sound.on) playSfx("heartbeat"); }));
    at(3400, () => {
      // somewhere in the dark, low on the left or high on the right
      const low = Math.random() < 0.5;
      eyes.style.left = low ? "14%" : "62%";
      eyes.style.top = low ? "66%" : "24%";
      eyes.hidden = false;
      const blink = [{ transform: "scaleY(0.05)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1, offset: 0.15 }, { transform: "scaleY(1)", opacity: 1, offset: 0.45 },
        { transform: "scaleY(0.1)", opacity: 1, offset: 0.5 }, { transform: "scaleY(1)", opacity: 1, offset: 0.55 }, { transform: "scaleY(1)", opacity: 1, offset: 0.8 },
        { transform: "scaleY(0.1)", opacity: 1, offset: 0.85 }, { transform: "scaleY(1)", opacity: 1, offset: 0.9 }, { transform: "scaleY(1)", opacity: 0 }];
      eyes.querySelectorAll("i").forEach((eye) => eye.animate(reduced ? [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }] : blink,
        { duration: 2800, easing: "ease-in-out", fill: "forwards" }));
    });
    at(6400, () => { fade(0, 1400); eyes.hidden = true; hint.textContent = "It's still there. You just can't see it."; });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    dark.getAnimations().forEach((a) => a.cancel());
    eyes.querySelectorAll("i").forEach((eye) => eye.getAnimations().forEach((a) => a.cancel()));
    eyes.hidden = true;
  },
});
