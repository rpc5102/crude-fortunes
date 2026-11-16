/*
 * "Gravity has given up on you.": the cookie, the slip and even the hint float up and off
 * the screen to a slide whistle. (Translate only above the filtered cookie: Safari.)
 */
import { playSfx } from "../audio/sfx";
import { bob, hint, slipPos } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

let timers: number[] = [], drifts: Animation[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

registerGimmick({
  match: (f) => SPECIAL.gravity.test(f),
  landed() {
    at(900, () => {
      const reduced = reducedMotion();
      if (sound.on) playSfx("slideWhistle");
      const float = (el: Element, delay: number, keyframes: Keyframe[]): Animation => {
        const a = el.animate(reduced ? [{ opacity: 1 }, { opacity: 0 }] : keyframes,
          { duration: reduced ? 600 : 3200, delay: reduced ? 0 : delay, easing: "cubic-bezier(.45,0,.75,.6)", fill: "forwards" });
        drifts.push(a);
        return a;
      };
      float(bob, 0, [{ transform: "translateY(0)" }, { transform: "translateY(-8%)", offset: 0.15 }, { transform: "translateY(-160vh)" }]);
      float(slipPos, 250, [{ transform: "translateY(0) rotate(0deg)" }, { transform: "translateY(-6%) rotate(-2deg)", offset: 0.15 }, { transform: "translateY(-150vh) rotate(-14deg)" }]);
      const hintDrift = float(hint, 600, [{ transform: "translateY(0) rotate(0deg)" }, { transform: "translateY(-120vh) rotate(9deg)" }]);
      at(reduced ? 900 : 4200, () => {
        hintDrift.cancel();   // the hint comes back down to say so
        hint.textContent = "Well, that's gone.";
      });
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    drifts.forEach((a) => a.cancel()); drifts = [];
  },
});
