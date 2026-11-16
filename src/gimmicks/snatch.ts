/*
 * "Hold on to this one. Tight.": a raccoon paw darts in from the side, grabs the slip and
 * yanks it off the screen. Yoink.
 */
import { playSfx } from "../audio/sfx";
import { hint, slipPos } from "../elements";
import { game } from "../game";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const paw = document.createElement("div");
paw.className = "paw";
paw.hidden = true;
paw.setAttribute("aria-hidden", "true");
paw.innerHTML = `
  <svg viewBox="0 0 120 70">
    <path d="M120 22 H70 C60 22 52 26 48 34 C52 42 60 48 70 48 H120 Z" fill="#4A4542"/>
    <path d="M120 26 H96 M120 44 H96" stroke="#2E2A28" stroke-width="5" stroke-linecap="round"/>
    <g class="paw-fingers" fill="#3A3634" stroke="#26221F" stroke-width="1.5">
      <ellipse cx="44" cy="17" rx="14" ry="5.5" transform="rotate(-18 44 17)"/>
      <ellipse cx="38" cy="28" rx="15" ry="5.5" transform="rotate(-5 38 28)"/>
      <ellipse cx="38" cy="40" rx="15" ry="5.5" transform="rotate(6 38 40)"/>
      <ellipse cx="44" cy="51" rx="13" ry="5.5" transform="rotate(18 44 51)"/>
    </g>
    <g fill="#E8E2D6"><path d="M30 13 l-6 -2 l5 5 z"/><path d="M23 26 l-7 0 l6 4 z"/><path d="M23 39 l-7 1 l6 3 z"/><path d="M31 55 l-6 3 l7 -1 z"/></g>
    <ellipse cx="62" cy="35" rx="9" ry="8" fill="#6A625C"/>
  </svg>`;
document.body.append(paw);

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

registerGimmick({
  match: (f) => SPECIAL.snatch.test(f),
  landed() {
    at(1300, () => {
      const reduced = reducedMotion();
      if (reduced) {
        game.slipShown = false;
        slipPos.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
        if (sound.on) playSfx("yoink");
        hint.textContent = "Something took it. Should've held on tighter.";
        return;
      }
      // line the paw up with the slip's right end
      const r = slipPos.getBoundingClientRect();
      paw.style.top = `${r.top + r.height / 2}px`;
      paw.hidden = false;
      if (sound.on) playSfx("swish");
      paw.animate([{ transform: "translate(110%, -50%)" }, { transform: `translate(${Math.max(0, innerWidth - r.right - 30)}px, -50%)` }],
        { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" })
        .finished.then(() => {
          // grab...
          paw.querySelector(".paw-fingers")!.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0.7)" }], { duration: 90, fill: "forwards" });
          at(220, () => {
            // ...and yank
            if (sound.on) playSfx("yoink");
            game.slipShown = false;
            const off = `${innerWidth + 40}px`;
            paw.animate([{ transform: `translate(${Math.max(0, innerWidth - r.right - 30)}px, -50%)` }, { transform: `translate(calc(${off} + 0px), -50%)` }],
              { duration: 320, easing: "cubic-bezier(.6,0,.9,.5)", fill: "forwards" });
            slipPos.animate([{ translate: "-50% -50%" }, { translate: `calc(-50% + ${off}) -50%` }],
              { duration: 330, easing: "cubic-bezier(.6,0,.9,.5)", fill: "forwards" });
            at(450, () => { hint.textContent = "Should've held on tighter."; });
          });
        }).catch(() => {});
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    [paw, paw.querySelector(".paw-fingers")!, slipPos].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    paw.hidden = true;
  },
});
