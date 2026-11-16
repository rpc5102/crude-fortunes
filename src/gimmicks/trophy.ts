/*
 * "Congratulations on existing. Here's a participation trophy.": a cheap plastic trophy
 * drops in to a sad kazoo fanfare and three lonely bits of confetti. Then a handle falls off.
 */
import { playSfx } from "../audio/sfx";
import { hint, stage } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const trophy = document.createElement("div");
trophy.className = "trophy";
trophy.hidden = true;
trophy.setAttribute("aria-hidden", "true");
trophy.innerHTML = `
  <svg viewBox="0 0 80 100">
    <ellipse cx="40" cy="96" rx="30" ry="4" fill="rgba(60, 0, 8, 0.35)"/>
    <rect x="14" y="78" width="52" height="16" rx="2" fill="#8A5A2E"/><rect x="14" y="78" width="52" height="3" fill="#A87442"/>
    <rect x="25" y="82" width="30" height="8" rx="1" fill="#D9C27A"/>
    <text x="40" y="88.3" text-anchor="middle" font-size="5" font-family="sans-serif" font-weight="700" fill="#5A4210">PARTICIPANT</text>
    <rect x="34" y="62" width="12" height="16" fill="#D8C24A"/><rect x="28" y="72" width="24" height="6" rx="1" fill="#CDB43E"/>
    <path d="M18 14 H62 V30 C62 48 52 60 40 62 C28 60 18 48 18 30 Z" fill="#E2C94E"/>
    <path d="M24 18 H32 V34 C32 44 36 50 38 52 C30 50 24 42 24 32 Z" fill="#F4E58E" opacity="0.8"/>
    <path d="M18 20 C6 20 6 42 22 44" fill="none" stroke="#D8C24A" stroke-width="4" stroke-linecap="round"/>
    <path class="trophy-handle" d="M62 20 C74 20 74 42 58 44" fill="none" stroke="#D8C24A" stroke-width="4" stroke-linecap="round"/>
    <text x="40" y="38" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="700" fill="#B49A2A">#1?</text>
  </svg>`;
const confetti = document.createElement("div");
confetti.className = "sad-confetti";
confetti.hidden = true;
confetti.setAttribute("aria-hidden", "true");
confetti.innerHTML = "<i></i><i></i><i></i>";
stage.append(trophy, confetti);
const handle = trophy.querySelector<SVGPathElement>(".trophy-handle")!;

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

registerGimmick({
  match: (f) => SPECIAL.trophy.test(f),
  landed() {
    const reduced = reducedMotion();
    at(400, () => {
      trophy.hidden = false;
      trophy.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { opacity: 1, transform: "translateY(-260%)" },
        { opacity: 1, transform: "translateY(0)", offset: 0.55, easing: "ease-out" },
        { opacity: 1, transform: "translateY(-14%)", offset: 0.75, easing: "ease-in" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: reduced ? 200 : 650, easing: "ease-in", fill: "forwards" });
    });
    at(reduced ? 600 : 1050, () => {
      if (sound.on) playSfx("kazoo");
      hint.textContent = "Congratulations. Technically.";
      if (!reduced) {
        confetti.hidden = false;
        confetti.querySelectorAll("i").forEach((bit, i) => bit.animate([
          { opacity: 1, transform: "translate(0, 0) rotate(0deg)" },
          { opacity: 1, transform: `translate(${i % 2 ? 14 : -14}px, 110px) rotate(${200 + i * 70}deg)`, offset: 0.5 },
          { opacity: 0, transform: `translate(${i % 2 ? -6 : 8}px, 230px) rotate(${420 + i * 90}deg)` }
        ], { duration: 2600, delay: i * 260, easing: "ease-in-out", fill: "forwards" }));
      }
    });
    at(reduced ? 2000 : 2700, () => {
      if (sound.on) playSfx("clack");
      if (reduced) handle.style.opacity = "0";
      else handle.animate([
        { transform: "none", opacity: 1 },
        { transform: "translate(6px, 30px) rotate(70deg)", opacity: 1, offset: 0.7 },
        { transform: "translate(10px, 46px) rotate(95deg)", opacity: 0 }
      ], { duration: 700, easing: "ease-in", fill: "forwards" });
      hint.textContent = "You did it. Technically. The handle didn't.";
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    [trophy, handle, ...confetti.children].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    handle.style.opacity = "";
    trophy.hidden = true; confetti.hidden = true;
  },
});
