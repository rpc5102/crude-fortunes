/*
 * "This fortune will self-destruct in 5 seconds.": a countdown badge beeps down on the
 * slip, which trembles harder and harder; at zero it blows up, chars and crumbles to ash.
 */
import { playSfx } from "../audio/sfx";
import { hint, page, slip, stage } from "../elements";
import { game } from "../game";
import { reducedMotion } from "../lib/dom";
import { burst } from "../particles";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const ASH = ["#3A3430", "#5A524C", "#2A2522", "#77706A", "#1E1A18"];

const paper = slip.querySelector<HTMLElement>(".slip-paper")!;
const badge = document.createElement("div");
badge.className = "countdown";
badge.hidden = true;
const burn = document.createElement("div");
burn.className = "burn";
burn.hidden = true;
paper.append(badge, burn);
const smoke = document.createElement("div");
smoke.className = "smoke";
smoke.hidden = true;
smoke.setAttribute("aria-hidden", "true");
smoke.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
stage.append(smoke);
const flash = document.createElement("div");
flash.className = "boom-flash";
flash.setAttribute("aria-hidden", "true");
document.body.append(flash);

let timers: number[] = [], shake: Animation | null = null;
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

function explode(): void {
  const reduced = reducedMotion();
  badge.hidden = true;
  shake?.cancel(); shake = null;
  if (sound.on) playSfx("boom");
  game.slipShown = false;   // it's gone; the round's exit shouldn't fade it out again
  burn.hidden = false;
  burn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 200 : 140, fill: "forwards" });
  const crumble = slip.animate(reduced ? [{ opacity: 1 }, { opacity: 0 }] : [
    { opacity: 1, transform: "none" },
    { opacity: 1, transform: "scale(1.04)", offset: 0.15 },
    { opacity: 0, transform: "translateY(35%) scale(0.85, 0.6)" }
  ], { duration: reduced ? 600 : 900, delay: reduced ? 300 : 200, easing: "ease-in", fill: "forwards" });
  if (!reduced) {
    flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 0 }], { duration: 650, easing: "ease-out" });
    page.animate([{ translate: "0 0" }, { translate: "-9px 5px" }, { translate: "8px -6px" }, { translate: "-5px 3px" }, { translate: "3px 0" }, { translate: "0 0" }], { duration: 420 });
    const r = paper.getBoundingClientRect();
    for (let i = 0; i < 4; i++) burst(r.left + r.width * (0.15 + 0.23 * i), r.top + r.height / 2, true, false, 16, ASH);
    burst(r.left + r.width / 2, r.top + r.height / 2, false, true);   // a few last embers
    smoke.hidden = false;
    smoke.querySelectorAll("i").forEach((puff, i) => puff.animate([
      { opacity: 0, transform: "translate(0, 0) scale(0.4)" },
      { opacity: 0.75, transform: `translate(${(i - 2) * 14}%, -30%) scale(1)`, offset: 0.25 },
      { opacity: 0, transform: `translate(${(i - 2) * 30}%, -140%) scale(1.9)` }
    ], { duration: 2600, delay: 150 + i * 90, easing: "ease-out", fill: "forwards" }));
  }
  crumble.finished.then(() => { hint.textContent = "Gone. Like your chances."; }).catch(() => {});
}

registerGimmick({
  match: (f) => SPECIAL.selfDestruct.test(f),
  landed() {
    const reduced = reducedMotion();
    for (let n = 5; n >= 0; n--) {
      at(600 + (5 - n) * 1000, () => {
        if (n === 0) { explode(); return; }
        badge.hidden = false;
        badge.textContent = String(n);
        if (!reduced) badge.animate([{ scale: "1.5" }, { scale: "1" }], { duration: 250, easing: "ease-out" });
        if (sound.on) playSfx(n === 1 ? "beepLast" : "beep");
        if (n === 5) hint.textContent = "Uh oh.";
        if (n === 2 && !reduced) {
          // the slip starts to shake itself apart
          shake = paper.animate([{ translate: "0 0" }, { translate: "-2px 1px" }, { translate: "2px -1px" }, { translate: "-1px -1px" }, { translate: "0 0" }], { duration: 120, iterations: Infinity });
        }
      });
    }
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    shake?.cancel(); shake = null;
    badge.hidden = true; burn.hidden = true; smoke.hidden = true;
    [burn, ...smoke.children].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  },
});
