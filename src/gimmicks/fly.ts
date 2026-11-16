/*
 * "Something in here smells like you.": a fly buzzes around the screen (its buzz panned
 * with it) until you swat it. Splat.
 */
import { playSfx, startBuzz, type BuzzSound } from "../audio/sfx";
import { hint, slip } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { tally } from "../stats";
import { registerGimmick } from "./registry";

const fly = document.createElement("div");
fly.className = "fly";
fly.hidden = true;
fly.setAttribute("role", "button");
fly.setAttribute("aria-label", "Swat the fly");
fly.innerHTML = `
  <svg class="fly-alive" viewBox="0 0 40 40" aria-hidden="true">
    <g class="fly-wings" fill="rgba(222, 236, 255, 0.6)" stroke="rgba(255, 255, 255, 0.8)" stroke-width="0.8">
      <ellipse cx="12.5" cy="18" rx="7.5" ry="11" transform="rotate(-28 12.5 18)"/><ellipse cx="27.5" cy="18" rx="7.5" ry="11" transform="rotate(28 27.5 18)"/>
    </g>
    <g stroke="#1B1B1F" stroke-width="1.4" stroke-linecap="round"><path d="M15 22 L8 20 M15 26 L8 28 M16 30 L10 35 M25 22 L32 20 M25 26 L32 28 M24 30 L30 35"/></g>
    <ellipse cx="20" cy="25" rx="6" ry="9" fill="#1B1B1F"/>
    <path d="M15 25 h10 M15.5 28.5 h9" stroke="#3A3A44" stroke-width="1"/>
    <circle cx="20" cy="13.5" r="5" fill="#1B1B1F"/>
    <circle cx="17.2" cy="12" r="2.5" fill="#8E1B12"/><circle cx="22.8" cy="12" r="2.5" fill="#8E1B12"/>
  </svg>
  <svg class="fly-splat" viewBox="0 0 60 60" aria-hidden="true">
    <path d="M30 12 C36 14 38 20 44 18 C50 17 49 25 45 28 C52 31 50 39 43 38 C42 46 35 47 31 42 C26 48 18 45 19 38 C11 39 9 31 15 28 C10 22 15 16 21 19 C22 13 26 11 30 12 Z" fill="#4E5A22"/>
    <path d="M30 20 C35 21 38 26 36 31 C34 36 26 37 23 32 C21 27 25 20 30 20 Z" fill="#2E3412"/>
    <circle cx="50" cy="12" r="2.4" fill="#4E5A22"/><circle cx="9" cy="47" r="1.8" fill="#4E5A22"/><circle cx="53" cy="44" r="1.5" fill="#4E5A22"/>
    <ellipse cx="40" cy="44" rx="5" ry="3" transform="rotate(30 40 44)" fill="rgba(222, 236, 255, 0.55)" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.6"/>
  </svg>`;
document.body.append(fly);

let raf = 0, buzz: BuzzSound | null = null, state: "gone" | "flying" | "splat" = "gone";
let x = 0, y = 0, seed = 0, started = 0, timers: number[] = [];
const later = (fn: () => void, ms: number): void => { timers.push(window.setTimeout(fn, ms)); };

function place(px: number, py: number, angle: number): void {
  fly.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`;
}

// a wandering loop around the middle of the screen, entering from the top-right corner
function frame(now: number): void {
  if (state !== "flying") return;
  const t = (now - started) / 1000, W = innerWidth, H = innerHeight;
  let nx = W * 0.5 + W * 0.36 * Math.sin(0.9 * t + 1.7 * Math.sin(0.31 * t + seed));
  let ny = H * 0.44 + H * 0.26 * Math.sin(1.3 * t + 1.1 * Math.sin(0.53 * t + seed * 2));
  if (t < 0.7) { const k = t / 0.7; nx = W + 40 + (nx - W - 40) * k; ny = -40 + (ny + 40) * k; }
  nx += (Math.random() - 0.5) * 2.5; ny += (Math.random() - 0.5) * 2.5;
  const dx = nx - x, dy = ny - y;
  place(nx, ny, (Math.atan2(dy, dx) * 180) / Math.PI + 90);
  x = nx; y = ny;
  if (buzz && !sound.on) { buzz.stop(); buzz = null; }   // sound switched off mid-buzz
  if (buzz && Math.round(t * 60) % 3 === 0) buzz.move((x / W) * 2 - 1, Math.min(1, Math.hypot(dx, dy) / 8));
  raf = requestAnimationFrame(frame);
}

function swat(): void {
  if (state !== "flying") return;
  state = "splat";
  cancelAnimationFrame(raf);
  buzz?.stop(); buzz = null;
  if (sound.on) playSfx("squish");
  tally("flies");
  fly.classList.add("splatted");
  fly.removeAttribute("role");
  place(x, y, Math.random() * 360);
  // it slides down the glass
  if (!reducedMotion()) fly.animate([{ translate: "0 0" }, { translate: "0 26px" }], { duration: 4000, easing: "ease-in", fill: "forwards" });
  hint.textContent = "You killed the only one who liked you.";
}
fly.addEventListener("pointerdown", (e) => { e.preventDefault(); swat(); });
fly.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") swat(); });

registerGimmick({
  match: (f) => SPECIAL.fly.test(f),
  landed() {
    later(() => {
      state = "flying";
      fly.hidden = false;
      fly.classList.remove("splatted");
      fly.setAttribute("role", "button");
      fly.tabIndex = 0;
      if (sound.on) buzz = startBuzz();
      hint.textContent = "Ugh. Flies love you.";
      if (reducedMotion()) {
        // it just sits on the corner of the slip, rubbing its hands together
        const r = slip.getBoundingClientRect();
        x = r.right - 26; y = r.top + 6;
        place(x, y, -20);
        buzz?.move((x / innerWidth) * 2 - 1, 0);
      } else {
        seed = Math.random() * 6; started = performance.now(); x = innerWidth + 40; y = -40;
        raf = requestAnimationFrame(frame);
      }
    }, 400);
  },
  end() {
    timers.forEach(clearTimeout); timers = [];
    cancelAnimationFrame(raf);
    buzz?.stop(); buzz = null;
    const was = state;
    state = "gone";
    if (was === "gone") return;
    const done = (): void => { fly.hidden = true; fly.getAnimations().forEach((a) => a.cancel()); };
    fly.animate(was === "flying" && !reducedMotion()
      ? [{ translate: "0 0", opacity: 1 }, { translate: "-140vw -60vh", opacity: 1 }]   // it buzzes off
      : [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: "ease-in" }).finished.then(done).catch(done);
  },
});
