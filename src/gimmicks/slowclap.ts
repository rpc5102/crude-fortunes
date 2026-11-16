/*
 * "Let's all give a big round of applause for your effort.": one person slow-claps,
 * alone, five times. Then coughs.
 */
import { playSfx } from "../audio/sfx";
import { hint, slipPos } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const caption = document.createElement("p");
caption.className = "clap-caption";
caption.setAttribute("aria-live", "polite");
slipPos.append(caption);

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

function say(text: string): void {
  caption.textContent = text;
  caption.classList.add("on");
  if (!reducedMotion()) caption.animate([{ transform: "scale(1.25)", opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 180, easing: "ease-out" });
}

registerGimmick({
  match: (f) => SPECIAL.slowClap.test(f),
  landed() {
    for (let i = 0; i < 5; i++) {
      at(700 + i * 1100, () => {
        if (sound.on) playSfx("clap");
        say(`*clap*${i ? ` ×${i + 1}` : ""}`);
        if (i === 2) hint.textContent = "...";
      });
    }
    at(700 + 5 * 1100 + 400, () => {
      if (sound.on) playSfx("cough");
      say("*cough*");
      hint.textContent = "Truly inspiring. Said no one.";
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    caption.classList.remove("on");
  },
});
