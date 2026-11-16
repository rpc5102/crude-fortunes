/*
 * "Your real fortune is written on the back.": the next tap flips the slip over instead
 * of starting a new round. The back is not kind.
 */
import { playSfx } from "../audio/sfx";
import { hint, slip } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const paper = slip.querySelector<HTMLElement>(".slip-paper")!;
const back = document.createElement("div");
back.className = "slip-back";
back.innerHTML = `<p class="fortune-text">Why would there be anything on the back?</p><p class="slip-back-insult">You absolute walnut.</p>`;
paper.append(back);

let armed = false, flip: Animation | null = null;

registerGimmick({
  match: (f) => SPECIAL.flipside.test(f),
  landed() {
    armed = true;
    hint.textContent = "Flip it over.";
  },
  tapOpen() {
    if (!armed) return false;
    armed = false;
    if (sound.on) playSfx("swish");
    if (reducedMotion()) paper.classList.add("flipped-flat");
    else {
      paper.classList.add("flippable");
      flip = paper.animate([
        { transform: "perspective(900px) rotateY(0deg)" },
        { transform: "perspective(900px) rotateY(100deg) translateZ(20px)", offset: 0.45 },
        { transform: "perspective(900px) rotateY(180deg)" }
      ], { duration: 650, easing: "ease-in-out", fill: "forwards" });
    }
    hint.textContent = "Happy now?";
    return true;
  },
  end() {
    armed = false;
    flip?.cancel(); flip = null;
    paper.classList.remove("flippable", "flipped-flat");
  },
});
