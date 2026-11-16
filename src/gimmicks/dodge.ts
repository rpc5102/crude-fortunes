/*
 * "Even this cookie didn't want to be touched by you.": the closed cookie dodges your
 * first three taps, blowing a raspberry each time, then gives up. You find out why when
 * it finally opens. Only translate/scale move it (Safari: no rotation above the filter).
 */
import { playSfx } from "../audio/sfx";
import { bob, hint } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const MOVES: [x: number, y: number, taunt: string][] = [
  [-34, -6, "Nope."],
  [30, 8, "Too slow."],
  [-10, -18, "Pathetic. Try harder."],
];

let dodges = 0, x = 0, y = 0, giveUp = 0;
let moves: Animation[] = [];

function moveTo(nx: number, ny: number, squash: boolean, duration: number): Animation {
  const mid = squash ? ` translate(0, -10%) scale(1.06, 0.9)` : "";
  const a = bob.animate([
    { transform: `translate(${x}%, ${y}%)` },
    { transform: `translate(${(x + nx) / 2}%, ${(y + ny) / 2}%)${mid}`, offset: 0.4 },
    { transform: `translate(${nx}%, ${ny}%)` }
  ], { duration, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" });
  moves.push(a);
  x = nx; y = ny;
  return a;
}

function reset(): void {
  clearTimeout(giveUp);
  moves.forEach((a) => a.cancel()); moves = [];   // the cookie's own bobbing takes over again
  x = 0; y = 0;
}

registerGimmick({
  match: (f) => SPECIAL.untouchable.test(f),
  loaded() { dodges = 0; reset(); },
  tapClosed() {
    if (dodges >= MOVES.length) { reset(); return false; }   // it gave up: open it (from the middle)
    const [nx, ny, taunt] = MOVES[dodges]!;
    dodges++;
    if (!reducedMotion()) moveTo(nx, ny, true, 260);
    if (sound.on) playSfx("raspberry");
    hint.textContent = taunt;
    if (dodges === MOVES.length) {
      giveUp = window.setTimeout(() => {
        hint.textContent = "Ugh. Fine. Get it over with.";
        if (!reducedMotion()) moveTo(0, 0, false, 500).finished.then(reset).catch(() => {});
      }, 900);
    }
    return true;
  },
  end() { dodges = 0; reset(); },
});
