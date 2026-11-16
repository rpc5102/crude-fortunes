/*
 * "Your personality is loading...": a progress bar under the slip crawls to 99%, stalls,
 * and fails. Personality not found.
 */
import { playSfx } from "../audio/sfx";
import { hint, slip } from "../elements";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const paper = slip.querySelector<HTMLElement>(".slip-paper")!;
const bar = document.createElement("div");
bar.className = "loadbar";
bar.hidden = true;
bar.innerHTML = `<div class="loadbar-track"><div class="loadbar-fill"></div></div><p class="loadbar-label"></p>`;
paper.append(bar);
const fill = bar.querySelector<HTMLElement>(".loadbar-fill")!;
const label = bar.querySelector<HTMLElement>(".loadbar-label")!;

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };
const progress = (pct: number): void => { fill.style.width = `${pct}%`; label.textContent = `Loading personality... ${pct}%`; };

registerGimmick({
  match: (f) => SPECIAL.loading.test(f),
  landed() {
    at(500, () => { bar.hidden = false; bar.classList.remove("failed"); progress(0); });
    // it races ahead, then crawls, then stops just short
    ([[900, 12], [1200, 34], [2100, 35], [2500, 71], [3300, 72], [3600, 98], [4400, 99]] as const)
      .forEach(([ms, pct]) => at(ms, () => progress(pct)));
    at(6400, () => {
      bar.classList.add("failed");
      label.textContent = "Error 404: personality not found.";
      if (sound.on) playSfx("errorChime");
      hint.textContent = "Have you tried turning yourself off and on again?";
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    bar.hidden = true;
  },
});
