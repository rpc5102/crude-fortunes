/*
 * The rubber stamp: "Your application for a better life has been reviewed." and friends.
 * Once the slip lands, a big red DENIED / REJECTED / IGNORED slams onto it.
 */
import { playSfx } from "../audio/sfx";
import { hint, page, slip } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const VERDICTS: [RegExp, string, string][] = [
  [/reviewed/, "Denied", "Denied. Obviously."],
  [/processed/, "Rejected", "Rejected. Shocking, truly."],
  [/forwarded/, "Ignored", "Ignored. Like your texts."],
];

const paper = slip.querySelector<HTMLElement>(".slip-paper")!;
const stamp = document.createElement("div");
stamp.className = "stamp";
stamp.hidden = true;
paper.append(stamp);

let timers: number[] = [];
const later = (fn: () => void, ms: number): void => { timers.push(window.setTimeout(fn, ms)); };

registerGimmick({
  match: (f) => SPECIAL.stamped.test(f),
  landed(f) {
    const [, word, taunt] = VERDICTS.find(([re]) => re.test(f)) ?? VERDICTS[0]!;
    later(() => {
      const reduced = reducedMotion();
      stamp.textContent = word;
      stamp.hidden = false;
      stamp.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { opacity: 0, scale: 2.6 }, { opacity: 1, scale: 0.92, offset: 0.75 }, { opacity: 1, scale: 1 }
      ], { duration: reduced ? 150 : 200, easing: "ease-in", fill: "forwards" });
      const impact = reduced ? 0 : 150;
      if (!reduced) {
        // the thump: the paper and the whole page jolt as it lands
        paper.animate([{ translate: "0 0" }, { translate: "0 4px" }, { translate: "0 0" }], { duration: 140, delay: impact });
        page.animate([{ translate: "0 0" }, { translate: "2px 3px" }, { translate: "-2px 0" }, { translate: "0 0" }], { duration: 180, delay: impact });
      }
      later(() => { if (sound.on) playSfx("stamp"); hint.textContent = taunt; }, impact);
    }, 450);   // let them read it first
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    stamp.getAnimations().forEach((a) => a.cancel());
    stamp.hidden = true;
  },
});
