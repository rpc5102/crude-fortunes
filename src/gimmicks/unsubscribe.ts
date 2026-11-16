/*
 * "You have been unsubscribed from good luck.": a notification drops in from the top.
 * Its Undo button does not undo anything.
 */
import { playSfx } from "../audio/sfx";
import { hint } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { registerGimmick } from "./registry";

const toast = document.createElement("div");
toast.className = "toast";
toast.hidden = true;
toast.setAttribute("role", "status");
toast.innerHTML = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 3 L20 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  <div class="toast-text"><b>Unsubscribed from: Good luck</b><span>You will no longer receive good things.</span></div>
  <button type="button" class="toast-undo">Undo</button>`;
document.body.append(toast);
const title = toast.querySelector("b")!;
const detail = toast.querySelector("span")!;
const undo = toast.querySelector<HTMLButtonElement>(".toast-undo")!;

let timers: number[] = [];
const at = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)); };

function slide(show: boolean): void {
  if (show) toast.hidden = false;
  const a = toast.animate(reducedMotion() ? [{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }]
    : [{ transform: `translateY(${show ? "-140%" : "0"})` }, { transform: `translateY(${show ? "0" : "-140%"})` }],
    { duration: 280, easing: show ? "cubic-bezier(.2,.8,.3,1)" : "ease-in", fill: "forwards" });
  if (!show) a.finished.then(() => { toast.hidden = true; }).catch(() => {});
}

undo.addEventListener("click", () => {
  timers.forEach(clearTimeout); timers = [];
  if (sound.on) playSfx("buzz");
  title.textContent = "Undo failed.";
  detail.textContent = "Nice try.";
  undo.disabled = true;
  if (!reducedMotion()) toast.animate([{ translate: "0 0" }, { translate: "-8px 0" }, { translate: "8px 0" }, { translate: "-4px 0" }, { translate: "0 0" }], { duration: 260 });
  hint.textContent = "No take-backs.";
  at(1600, () => slide(false));
});

registerGimmick({
  match: (f) => SPECIAL.unsubscribed.test(f),
  landed() {
    at(600, () => {
      title.textContent = "Unsubscribed from: Good luck";
      detail.textContent = "You will no longer receive good things.";
      undo.disabled = false;
      slide(true);
      if (sound.on) playSfx("notify");
    });
    at(7000, () => { slide(false); hint.textContent = "Too late anyway."; });
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    toast.getAnimations().forEach((a) => a.cancel());
    toast.hidden = true;
  },
});
