/*
 * "Fortune.exe has stopped believing in you.": the screen glitches out (jitter, colour
 * bars, scrambled slip text, digital noise), then a retro error dialog blames you.
 */
import { playSfx } from "../audio/sfx";
import { fortuneEl, hint, stage } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const bars = document.createElement("div");
bars.className = "glitch-bars";
bars.setAttribute("aria-hidden", "true");

const dialog = document.createElement("div");
dialog.className = "crash";
dialog.hidden = true;
dialog.innerHTML = `
  <div class="crash-win" role="alertdialog" aria-modal="true" aria-labelledby="crash-title" aria-describedby="crash-msg">
    <div class="crash-bar"><span id="crash-title">Fortune.exe</span><span class="crash-x" aria-hidden="true">✕</span></div>
    <div class="crash-body">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L30 28 H2 Z" fill="#F2C230" stroke="#3A2A00" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 11 V19" stroke="#3A2A00" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="23.5" r="1.8" fill="#3A2A00"/></svg>
      <p id="crash-msg">Fortune.exe has stopped believing in you.<small>Error 0xDEADBEEF: the problem is between the screen and the chair.</small></p>
    </div>
    <div class="crash-actions"><button type="button" class="crash-close">Close</button><button type="button" class="crash-harder">Close harder</button></div>
  </div>`;
document.body.append(bars, dialog);
const win = dialog.querySelector<HTMLElement>(".crash-win")!;
const btnClose = dialog.querySelector<HTMLButtonElement>(".crash-close")!;
const btnHarder = dialog.querySelector<HTMLButtonElement>(".crash-harder")!;

let timers: number[] = [];
const later = (fn: () => void, ms: number): void => { timers.push(window.setTimeout(fn, ms)); };
const GLYPHS = "█▓▒░#@%&$?!<>/\\|01";

function scramble(text: string, amount: number): string {
  return [...text].map((c) => (c !== " " && Math.random() < amount ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : c)).join("");
}

function close(how: "close" | "harder"): void {
  if (dialog.hidden) return;
  const finish = (): void => {
    dialog.hidden = true;
    hint.textContent = how === "harder" ? "Wow. Aggressive. Noted." : "It's not a bug. It's you.";
    stage.focus({ preventScroll: true });
  };
  if (how === "harder" && !reducedMotion()) {
    if (sound.on) playSfx("buzz");
    win.animate([{ translate: "0 0" }, { translate: "-12px 4px" }, { translate: "12px -4px" }, { translate: "-8px 2px" }, { translate: "8px 0" }, { translate: "0 0" }], { duration: 320 })
      .finished.then(finish).catch(finish);
  } else finish();
}
btnClose.addEventListener("click", () => close("close"));
btnHarder.addEventListener("click", () => close("harder"));
dialog.addEventListener("keydown", (e) => { if (e.key === "Escape") close("close"); });
// tapping around the dialog: it won't go away that easily
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog || reducedMotion()) return;
  win.animate([{ scale: "1" }, { scale: "1.04" }, { scale: "1" }], { duration: 160 });
});

registerGimmick({
  match: (f) => SPECIAL.crash.test(f),
  landed() {
    const reduced = reducedMotion();
    const original = fortuneEl.textContent ?? "";
    later(() => {
      if (sound.on) playSfx("glitch");
      if (!reduced) {
        document.body.classList.add("glitching");
        // scramble the slip, unless something else (rage) rewrites it meanwhile
        let shown = original;
        for (let i = 0; i < 12; i++) later(() => {
          if (fortuneEl.textContent !== shown) return;
          shown = scramble(original, 0.15 + 0.5 * Math.random());
          fortuneEl.textContent = shown;
        }, i * 70);
        later(() => {
          document.body.classList.remove("glitching");
          if (fortuneEl.textContent === shown) fortuneEl.textContent = original;
        }, 900);
      }
      later(() => {
        dialog.hidden = false;
        win.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, scale: "0.85" }, { opacity: 1, scale: "1.02", offset: 0.7 }, { opacity: 1, scale: "1" }], { duration: reduced ? 150 : 180 });
        if (sound.on) playSfx("errorChime");
        btnClose.focus({ preventScroll: true });
      }, reduced ? 300 : 950);
    }, 700);
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    document.body.classList.remove("glitching");
    dialog.hidden = true;
  },
});
