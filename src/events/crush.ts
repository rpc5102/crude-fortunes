/* Hold to crush (cookie only): the cookie squashes and collapses into a crumpled paper ball. */
import { playSfx } from "../audio/sfx";
import { cookie, hint, paperball, stage } from "../elements";
import { game } from "../game";
import { anim, reducedMotion } from "../lib/dom";
import { burst } from "../particles";
import { sound, startMusicOnce } from "../sound";

const HOLD_DELAY = 280, CRUSH_TIME = 1700;
let holdTimer = 0, crushing = false, crushStart = 0, crushRaf = 0, lastCrumb = 0, lastCrunch = 0, suppressClick = false;

/** The click that ends a hold must not also open the cookie. Returns true if this click is swallowed. */
export function consumeSuppressedClick(): boolean {
  if (suppressClick) { suppressClick = false; return true; }
  return false;
}

export function initCrush(): void {
  stage.addEventListener("contextmenu", (e) => e.preventDefault());
  stage.addEventListener("pointerdown", (e) => {
    // A hold released off the cookie gets no click, so its pending suppression must not
    // swallow this new tap. (Primary pointer only, so a second finger can't clear it mid-hold.)
    if (e.isPrimary) suppressClick = false;
    if (game.busy || game.state !== "closed" || game.kind !== "cookie") return;
    clearTimeout(holdTimer);
    holdTimer = window.setTimeout(beginCrush, HOLD_DELAY);
  });
  (["pointerup", "pointercancel", "pointerleave"] as const).forEach((ev) => stage.addEventListener(ev, () => {
    clearTimeout(holdTimer);
    if (crushing) releaseCrush();
  }));
}

function beginCrush(): void {
  crushing = true; game.busy = true; suppressClick = true;
  startMusicOnce();
  crushStart = performance.now();
  crushRaf = requestAnimationFrame(crushFrame);
}

function crushFrame(now: number): void {
  const p = Math.min(1, (now - crushStart) / CRUSH_TIME), e = p * p;
  if (reducedMotion()) {
    // no trembling or crumbs: the cookie just dims as it is crushed
    cookie.style.transform = "";
    cookie.style.opacity = String(1 - 0.5 * e);
  } else {
    const j = 1.5 + 6 * p;
    cookie.style.transform = `translate(${(Math.random() - 0.5) * j}px, ${(Math.random() - 0.5) * j + e * 18}px) scale(${1 + 0.18 * e}, ${1 - 0.55 * e})`;
    const r = stage.getBoundingClientRect();
    if (now - lastCrumb > 90 - 50 * p) { lastCrumb = now; burst(r.left + r.width * (0.3 + Math.random() * 0.4), r.top + r.height * (0.55 + 0.15 * e), true, false, 2 + Math.round(4 * p)); }
  }
  if (sound.on && now - lastCrunch > 170 - 90 * p) { lastCrunch = now; playSfx("crunch"); }
  if (p >= 1) { void finishCrush(); return; }
  crushRaf = requestAnimationFrame(crushFrame);
}

/** Let go early: the cookie springs back. */
function releaseCrush(): void {
  cancelAnimationFrame(crushRaf); crushing = false;
  const from = cookie.style.transform, dimmed = cookie.style.opacity;
  cookie.style.transform = ""; cookie.style.opacity = "";
  if (reducedMotion()) cookie.animate([{ opacity: dimmed || 1 }, { opacity: 1 }], { duration: 200 });
  else cookie.animate([{ transform: from }, { transform: "scale(1.04, 0.96)", offset: 0.6 }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.3,.7,.4,1.3)" });
  game.busy = false;
}

async function finishCrush(): Promise<void> {
  const reduced = reducedMotion();
  crushing = false;
  if (!reduced) {
    const r = stage.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.7, true, false, 45);
  }
  if (sound.on) { playSfx("crack"); setTimeout(() => playSfx("crumple"), 350); }
  cookie.style.opacity = "0";
  game.crushed = true; game.slipShown = false; stage.classList.add("is-open");
  await anim(paperball, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
    { opacity: 0, transform: "translateY(30%) scale(0.2) rotate(-40deg)" },
    { opacity: 1, transform: "translateY(-8%) scale(1.1) rotate(8deg)", offset: 0.6 },
    { opacity: 1, transform: "none" }
  ], { duration: 650, delay: 250, easing: "cubic-bezier(.3,.7,.4,1.2)" });
  hint.textContent = game.golden ? "You crushed a golden cookie. Tap for another one" : "Fortune ruined. Tap for another one";
  stage.setAttribute("aria-label", "Get another fortune cookie");
  game.state = "open"; game.busy = false;
}

/** Called by the next round: fade the paper ball out and restore the cookie. */
export async function clearCrush(): Promise<void> {
  await anim(paperball, [{ opacity: 1 }, { opacity: 0, transform: "translateY(20%) scale(0.8)" }], { duration: 300, easing: "ease-in" });
  paperball.getAnimations().forEach((a) => a.cancel());
  cookie.style.transform = ""; cookie.style.opacity = "";
  game.crushed = false;
}
