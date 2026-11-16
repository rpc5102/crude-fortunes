/*
 * "This cookie is still hungry.": a moment after the slip lands, the halves snap shut on
 * it, munch it three times, gulp, and burp.
 */
import { playSfx } from "../audio/sfx";
import { cookie, halfL, halfR, hint, poof, slip, stage } from "../elements";
import { game } from "../game";
import { anim, reducedMotion } from "../lib/dom";
import { burst } from "../particles";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

// where the halves end up after splitting (see stage.ts)
const SPLIT_L = "translate(-21%, 16%) rotate(-24deg) scale(0.7)";
const SPLIT_R = "translate(21%, 16%) rotate(24deg) scale(0.7)";

let run = 0;
const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function eat(me: number): Promise<void> {
  const live = (): boolean => run === me;
  const reduced = reducedMotion();
  await pause(1200);   // let them read it
  if (!live()) return;
  game.slipShown = false;   // it's going in the cookie, not fading out with the round
  // snap shut on the slip and suck it in
  await Promise.all([
    anim(halfL, [{ transform: SPLIT_L }, { transform: "none" }], { duration: reduced ? 1 : 240, easing: "cubic-bezier(.6,0,.9,.5)" }),
    anim(halfR, [{ transform: SPLIT_R }, { transform: "none" }], { duration: reduced ? 1 : 240, easing: "cubic-bezier(.6,0,.9,.5)" }),
    anim(slip, reduced ? [{ opacity: 1 }, { opacity: 0 }] : [
      { opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(30%) scale(0.18)" }
    ], { duration: reduced ? 200 : 260, easing: "ease-in" }),
  ]);
  // munch, munch, munch
  for (let i = 0; i < 3; i++) {
    if (!live()) return;
    if (sound.on) playSfx("crunch");
    if (!reduced) {
      const r = stage.getBoundingClientRect();
      burst(r.left + r.width * (0.35 + 0.3 * Math.random()), r.top + r.height * 0.3, true, false, 7);
      await anim(cookie, [{ transform: "none" }, { transform: "scale(1.06, 0.86)", offset: 0.45 }, { transform: "none" }], { duration: 170, fill: "none" });
    } else await pause(170);
    await pause(60);
  }
  if (!live()) return;
  if (sound.on) playSfx("gulp");
  if (!reduced) await anim(cookie, [{ transform: "none" }, { transform: "scale(0.94, 1.1)", offset: 0.5 }, { transform: "none" }], { duration: 220, fill: "none" });
  await pause(380);
  if (!live()) return;
  if (sound.on) playSfx("burp");
  if (!reduced) {
    cookie.animate([{ transform: "none" }, { transform: "scale(1.1)", offset: 0.25 }, { transform: "none" }], { duration: 500, easing: "ease-out" });
    // (the poof is centred with translate: -50% -50%, so keep that in the keyframes)
    poof.animate([{ opacity: 0, scale: 0.3, translate: "-50% -50%" }, { opacity: 0.8, scale: 0.8, translate: "-50% -80%", offset: 0.3 }, { opacity: 0, scale: 1.3, translate: "-50% -120%" }],
      { duration: 1100, easing: "ease-out" });
  }
  hint.textContent = "It ate your fortune. It was better than you anyway.";
}

registerGimmick({
  match: (f) => SPECIAL.hungry.test(f),
  landed() { void eat(++run); },
  end() { run++; },   // stops a meal in progress; the next round resets the halves and slip
});
