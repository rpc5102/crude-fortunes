/* Rage mode: 6 taps within 2s shakes the screen and swaps in an insult (except on special rounds). 4s cooldown. */
import { playSfx } from "../audio/sfx";
import { fortuneEl, fortuneText, luckyEl, page, stage } from "../elements";
import { draw } from "../fortunes";
import { game } from "../game";
import { $, reducedMotion, vibrate } from "../lib/dom";
import { sound } from "../sound";
import { isSpecial } from "../specials";

const rageFlash = $(".rage-flash");
let taps: number[] = [], rageCooldown = 0;

export function rage(): void {
  rageCooldown = performance.now() + 4000; taps = [];
  // Rage can land before or during an open. A special round keeps its fortune, so its
  // event (Council, call, upside-down Mercury...) isn't cancelled or left half-done. A golden
  // cookie keeps its 7s too.
  if (!isSpecial(fortuneText()) && !game.golden) {
    fortuneEl.textContent = draw("rage");
    luckyEl.querySelectorAll("span").forEach((s, i, all) => (s.textContent = "0" + (i < all.length - 1 ? "," : "")));
  }
  if (!reducedMotion()) { page.classList.remove("raging"); void page.offsetWidth; page.classList.add("raging"); }   // the red flash is a fade, so it stays
  rageFlash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 600, easing: "ease-out" });
  if (sound.on) playSfx("buzz");
  vibrate(300);
}

export function initRage(): void {
  stage.addEventListener("pointerdown", () => {
    const now = performance.now();
    if (now < rageCooldown) return;
    taps = taps.filter((t) => now - t < 2000); taps.push(now);
    if (taps.length >= 6) rage();
  });
}
