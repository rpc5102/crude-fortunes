/*
 * "Some fortune cookies contain no fortune.": the lucky numbers are slot-machine reels
 * that spin while the slip unrolls, then stop one by one, left to right, on "?".
 * Slot-machine sounds throughout. With reduced motion the numbers simply show "?" (as
 * loadFortune already rendered them) and only the losing jingle plays.
 */
import { playSfx, startReelSound, type ReelSound } from "../audio/sfx";
import { luckyEl } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";

const DIGITS = "7350918264";
let reels: HTMLElement[] = [], timers: number[] = [], spinning = 0, due = false;
let reelSound: ReelSound | null = null;

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
  endSlots();
  if (!SPECIAL.noFortune.test(fortune)) return;
  due = true;
  if (reducedMotion()) return;
  reels = [...luckyEl.querySelectorAll<HTMLElement>(":scope > span")];
  reels.forEach((span, i) => {
    const comma = i < reels.length - 1 ? "," : "";
    span.replaceChildren(reel(260 + i * 23), comma);
  });
  spinning = reels.length;
  if (sound.on) reelSound = startReelSound(reels.length);
}

/** Call once the slip has landed: stop the reels left to right. */
export function landSlots(): void {
  if (!due) return;
  if (!reels.length) {   // reduced motion: no reels, just the verdict
    if (sound.on) timers.push(window.setTimeout(() => playSfx("slotLose"), 300));
    return;
  }
  reels.forEach((span, i) => {
    timers.push(window.setTimeout(() => {
      const comma = i < reels.length - 1 ? "," : "";
      span.replaceChildren("?", comma);
      span.animate([{ transform: "translateY(-55%)" }, { transform: "translateY(12%)", offset: 0.6 }, { transform: "none" }],
        { duration: 220, easing: "ease-out" });
      reelSound?.stopReel(i, --spinning);
      if (spinning === 0 && sound.on) timers.push(window.setTimeout(() => playSfx("slotLose"), 300));
    }, 350 + i * 260));
  });
}

/** Next round: stop everything (loadFortune replaces the spans). */
export function endSlots(): void {
  timers.forEach(clearTimeout); timers = [];
  reelSound?.end(); reelSound = null;
  reels = []; spinning = 0; due = false;
}
