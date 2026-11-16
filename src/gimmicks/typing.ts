/*
 * "Your crush is typing...": a typing bubble pops up under the slip, goes away, comes
 * back, goes away again... and then: Seen.
 */
import { playSfx } from "../audio/sfx";
import { hint, slipPos } from "../elements";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const wrap = document.createElement("div");
wrap.className = "typing-wrap";
wrap.setAttribute("aria-hidden", "true");
wrap.innerHTML = `<div class="typing"><i></i><i></i><i></i></div><p class="seen"></p>`;
slipPos.append(wrap);
const bubble = wrap.querySelector<HTMLElement>(".typing")!;
const seen = wrap.querySelector<HTMLElement>(".seen")!;

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };
const show = (on: boolean): void => {
  bubble.classList.toggle("on", on);
  if (on && sound.on) playSfx("pop");
};

registerGimmick({
  match: (f) => SPECIAL.typing.test(f),
  landed() {
    at(700, () => { show(true); hint.textContent = "Ooh. They're typing."; });
    at(2900, () => show(false));
    at(3800, () => show(true));
    at(5300, () => show(false));
    at(5900, () => {
      seen.textContent = `Seen ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      seen.classList.add("on");
      hint.textContent = "Seen. No reply. Iconic.";
    });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    bubble.classList.remove("on"); seen.classList.remove("on");
  },
});
