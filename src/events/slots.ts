/*
 * "Some fortune cookies contain no fortune.": the lucky numbers are slot-machine reels
 * that spin while the slip unrolls, then stop one by one, left to right, on "?".
 * With reduced motion they simply show "?" (as loadFortune already rendered them).
 */
import { playSfx } from "../audio/sfx";
import { luckyEl } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";

const DIGITS = "7350918264";
let reels: HTMLElement[] = [], timers: number[] = [], ticker = 0, spinning = 0;

function reel(speed: number): HTMLElement {
  const box = document.createElement("span");
  box.className = "reel";
  const strip = document.createElement("span");
  strip.className = "reel-strip";
  strip.textContent = DIGITS + DIGITS[0];   // repeat the first digit so the loop is seamless
  box.append(strip);
  strip.animate([{ transform: "translateY(0)" }, { transform: `translateY(-${DIGITS.length / (DIGITS.length + 1) * 100}%)` }],
    { duration: speed, iterations: Infinity });
  return box;
}

/** Call as the slip starts to unroll. */
export function startSlotsIfDue(fortune: string): void {
  if (!SPECIAL.noFortune.test(fortune) || reducedMotion()) return;
  endSlots();
  reels = [...luckyEl.querySelectorAll<HTMLElement>(":scope > span")];
  reels.forEach((span, i) => {
    const comma = i < reels.length - 1 ? "," : "";
    span.replaceChildren(reel(260 + i * 23), comma);
  });
  spinning = reels.length;
  if (sound.on) ticker = window.setInterval(() => playSfx("tick"), 75);
}

/** Call once the slip has landed: stop the reels left to right. */
export function landSlots(): void {
  reels.forEach((span, i) => {
    timers.push(window.setTimeout(() => {
      const comma = i < reels.length - 1 ? "," : "";
      span.replaceChildren("?", comma);
      span.animate([{ transform: "translateY(-55%)" }, { transform: "translateY(12%)", offset: 0.6 }, { transform: "none" }],
        { duration: 220, easing: "ease-out" });
      if (sound.on) playSfx("clunk");
      if (--spinning === 0) {
        clearInterval(ticker);
        if (sound.on) timers.push(window.setTimeout(() => playSfx("slotLose"), 260));
      }
    }, 350 + i * 260));
  });
}

/** Next round: stop everything (loadFortune replaces the spans). */
export function endSlots(): void {
  timers.forEach(clearTimeout); timers = [];
  clearInterval(ticker); ticker = 0;
  reels = []; spinning = 0;
}
