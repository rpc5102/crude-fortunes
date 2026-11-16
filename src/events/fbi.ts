/*
 * "The FBI is watching your every move": a security-camera REC overlay, and the
 * seal's 福 is replaced by a pair of eyes that follow your finger. Until the next round.
 */
import { playSfx } from "../audio/sfx";
import { stage } from "../elements";
import { $ } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";

const eyes = document.createElement("div");
eyes.className = "seal-eyes";
eyes.innerHTML = `
  <svg viewBox="0 0 40 18">
    <defs><clipPath id="eyeClip"><ellipse cx="10" cy="9" rx="8.5" ry="6.5"/><ellipse cx="30" cy="9" rx="8.5" ry="6.5"/></clipPath></defs>
    <g class="blink">
      <g fill="#FBF7EC" stroke="#E3B54C" stroke-width="1.2"><ellipse cx="10" cy="9" rx="8.5" ry="6.5"/><ellipse cx="30" cy="9" rx="8.5" ry="6.5"/></g>
      <g clip-path="url(#eyeClip)"><g class="pupils">
        <circle cx="10" cy="9" r="3.6" fill="#2B0508"/><circle cx="30" cy="9" r="3.6" fill="#2B0508"/>
        <circle cx="11.2" cy="7.8" r="1" fill="#fff"/><circle cx="31.2" cy="7.8" r="1" fill="#fff"/>
      </g></g>
    </g>
  </svg>`;
$(".seal").append(eyes);
const pupils = eyes.querySelector<SVGGElement>(".pupils")!;

const rec = document.createElement("div");
rec.className = "rec";
rec.setAttribute("aria-hidden", "true");
rec.innerHTML = `<div class="rec-line"><i class="rec-dot"></i>REC <span class="rec-time">00:00:00</span></div><div class="rec-cam">CAM 04</div>`;
document.body.append(rec);
const recTime = rec.querySelector<HTMLElement>(".rec-time")!;

let active = false, clock = 0;

function look(x: number, y: number): void {
  const r = eyes.getBoundingClientRect();
  const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, d / 120);   // near the seal the pupils centre a little
  pupils.setAttribute("transform", `translate(${((dx / d) * 4.2 * k).toFixed(2)} ${((dy / d) * 2.6 * k).toFixed(2)})`);
}
const follow = (e: PointerEvent): void => look(e.clientX, e.clientY);

export function startFbiIfDue(fortune: string): void {
  if (active || !SPECIAL.fbi.test(fortune)) return;
  active = true;
  document.body.classList.add("fbi");
  const r = stage.getBoundingClientRect();
  look(r.left + r.width / 2, r.top + r.height / 2);   // eyeing the cookie until you move
  addEventListener("pointermove", follow, { passive: true });
  addEventListener("pointerdown", follow, { passive: true });
  const started = performance.now();
  const pad = (n: number): string => String(n).padStart(2, "0");
  const tick = (): void => {
    const s = Math.floor((performance.now() - started) / 1000);
    recTime.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  tick(); clock = window.setInterval(tick, 1000);
  if (sound.on) playSfx("rec");
}

export function endFbi(): void {
  if (!active) return;
  active = false;
  document.body.classList.remove("fbi");
  removeEventListener("pointermove", follow);
  removeEventListener("pointerdown", follow);
  clearInterval(clock);
}
