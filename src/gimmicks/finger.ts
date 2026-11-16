/*
 * "Pull my finger.": a cookie-coloured finger pokes up between the halves and beckons.
 * The next tap pulls it instead of starting a new round. You know what happens.
 */
import { playSfx } from "../audio/sfx";
import { hint, stage } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const finger = document.createElement("div");
finger.className = "finger";
finger.hidden = true;
finger.setAttribute("aria-hidden", "true");
finger.innerHTML = `
  <svg viewBox="0 0 40 92">
    <path d="M8 92 V21 a12 12 0 0 1 24 0 V92 z" fill="#E9B46A" stroke="#A8761C" stroke-width="2"/>
    <path d="M13.5 24 a6.5 6.5 0 0 1 13 0 v9 a6.5 4 0 0 1 -13 0 z" fill="#F7DDB0" stroke="#C49A55" stroke-width="1.2"/>
    <path d="M12 54 q8 4 16 0 M12 60 q8 4 16 0 M13 80 q7 3 14 0" fill="none" stroke="#A8761C" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
const stink = document.createElement("div");
stink.className = "stink";
stink.hidden = true;
stink.setAttribute("aria-hidden", "true");
stink.innerHTML = `<i></i><i></i><i></i><i></i>
  <svg viewBox="0 0 100 60"><path d="M22 58 q-8-10 0-20 t0-20 t0-16"/><path d="M50 58 q-8-10 0-20 t0-20 t0-16"/><path d="M78 58 q-8-10 0-20 t0-20 t0-16"/></svg>`;
const tint = document.createElement("div");
tint.className = "stink-tint";
tint.setAttribute("aria-hidden", "true");
stage.append(finger, stink);
document.body.append(tint);

let armed = false, timers: number[] = [];
const later = (fn: () => void, ms: number): void => { timers.push(window.setTimeout(fn, ms)); };

function pull(): void {
  const reduced = reducedMotion();
  finger.getAnimations().forEach((a) => a.cancel());
  // yank: it stretches as you pull, then snaps back into the cookie
  finger.animate(reduced ? [{ opacity: 1 }, { opacity: 0 }] : [
    { transform: "none", opacity: 1 },
    { transform: "translateY(-16%) scaleY(1.18)", opacity: 1, offset: 0.35 },
    { transform: "translateY(115%)", opacity: 0 }
  ], { duration: reduced ? 200 : 420, easing: "cubic-bezier(.5,0,.6,1)", fill: "forwards" });
  later(() => {
    if (sound.on) playSfx("fart");
    stink.hidden = false;
    // the cloud rises and spreads, the stink lines wobble up, the air turns green
    stink.querySelectorAll("i").forEach((blob, i) => blob.animate(reduced
      ? [{ opacity: 0 }, { opacity: 0.8, offset: 0.3 }, { opacity: 0 }]
      : [
        { opacity: 0, transform: "translate(0, 0) scale(0.3)" },
        { opacity: 0.85, transform: `translate(${(i - 1.5) * 18}%, -40%) scale(1)`, offset: 0.3 },
        { opacity: 0, transform: `translate(${(i - 1.5) * 34}%, -150%) scale(1.8)` }
      ], { duration: 2600, delay: i * 120, easing: "ease-out", fill: "forwards" }));
    stink.querySelector("svg")!.animate(reduced
      ? [{ opacity: 0 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0 }]
      : [{ opacity: 0, transform: "translateY(20%)" }, { opacity: 0.9, offset: 0.3 }, { opacity: 0, transform: "translateY(-60%)" }],
      { duration: 2400, delay: 200, easing: "ease-out", fill: "forwards" });
    tint.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 2600, easing: "ease-in-out" });
    hint.textContent = "You pulled it. This is on you.";
  }, reduced ? 0 : 140);
}

registerGimmick({
  match: (f) => SPECIAL.finger.test(f),
  landed() {
    later(() => {
      armed = true;
      finger.hidden = false;
      if (reducedMotion()) finger.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
      else {
        finger.animate([{ transform: "translateY(110%)", opacity: 0 }, { transform: "translateY(-8%)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }],
          { duration: 450, easing: "cubic-bezier(.3,.7,.4,1.2)", fill: "forwards" })
          .finished.then(() => {
            if (!armed) return;
            // beckoning
            finger.animate([{ rotate: "-9deg" }, { rotate: "9deg" }], { duration: 650, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
          }).catch(() => {});
      }
      hint.textContent = "Go on. Pull it.";
    }, 350);
  },
  tapOpen() {
    if (!armed) return false;
    armed = false;
    pull();
    return true;
  },
  end() {
    armed = false;
    timers.forEach(clearTimeout); timers = [];
    [finger, stink, ...stink.children].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    finger.hidden = true; stink.hidden = true;
  },
});
