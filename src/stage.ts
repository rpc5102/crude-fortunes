/* The round state machine: closed -> (tap) open -> (tap) new round, closed. */
import { playSfx } from "./audio/sfx";
import {
  cookie, flash, fortuneEl, fortuneText, halfL, halfR, hint, luckyEl, poof, slip, stage, stickL, stickU, sticks,
} from "./elements";
import { abduct, endAbduction } from "./events/abduction";
import { endCouncil, startCouncilIfDue } from "./events/council";
import { endSlots, landSlots, startSlotsIfDue } from "./events/slots";
import { endFbi, startFbiIfDue } from "./events/fbi";
import { endVictorian, startVictorianIfDue } from "./events/victorian";
import { scheduleCall } from "./events/call";
import { clearCrush, consumeSuppressedClick } from "./events/crush";
import { draw, luckyNumbers, type Mode } from "./fortunes";
import { game, type Kind } from "./game";
import { $, anim, ease, reducedMotion } from "./lib/dom";
import { random } from "./lib/random";
import { store } from "./lib/storage";
import { burst } from "./particles";
import { sound, startMusicOnce } from "./sound";
import { CALL, SPECIAL } from "./specials";

/** A forced round set up from the debug panel; consumed by the next pickKind/loadFortune. */
export interface RoundSetup { kind?: Kind; empty?: boolean; fortune?: string }
let setup: RoundSetup | null = null;

/** Per-round roll: 1 in 10 chopsticks, otherwise 1 in 25 empty cookie. */
export function pickKind(): void {
  if (setup) { game.kind = setup.kind ?? "cookie"; game.empty = setup.empty ?? false; }
  else if (game.forceCall) { game.kind = "cookie"; game.empty = false; }
  else {
    game.kind = random() < 0.1 ? "sticks" : "cookie";
    game.empty = game.kind === "cookie" && random() < 1 / 25;   // 1 in 25 cookies has no fortune
  }
  showKind();
}

function showKind(): void {
  cookie.hidden = game.kind !== "cookie";
  sticks.hidden = game.kind !== "sticks";
  hint.textContent = game.kind === "sticks" ? "Tap the chopsticks" : "Tap the cookie";
  stage.setAttribute("aria-label", game.kind === "sticks" ? "Split the chopsticks" : "Open the fortune cookie");
}

export function loadFortune(): void {
  luckyEl.querySelectorAll("span").forEach((s) => s.remove());
  stage.classList.remove("retro");
  const forced = setup?.fortune; setup = null;
  if (game.empty) { fortuneEl.textContent = ""; return; }
  fortuneEl.textContent = forced ?? (game.forceCall ? CALL : draw(game.kind === "sticks" ? "sticks" : game.mode));
  // Mercury in retrograde: the cookie shows up upside down
  if (SPECIAL.retrograde.test(fortuneText())) stage.classList.add("retro");
  const t = fortuneText();
  const nums: (number | string)[] = SPECIAL.council.test(t) ? Array<number>(6).fill(6)
    : SPECIAL.noFortune.test(t) ? Array<string>(6).fill("?")
    : luckyNumbers();
  nums.forEach((n, i, all) => {
    const s = document.createElement("span");
    s.textContent = n + (i < all.length - 1 ? "," : "");
    luckyEl.append(s);
  });
}

async function openCookie(): Promise<void> {
  const reduced = reducedMotion();
  startMusicOnce();
  if (!reduced) {
    await anim(game.kind === "sticks" ? sticks : cookie, [
      { transform: "rotate(0)" }, { transform: "rotate(-4deg) scale(1.02)" }, { transform: "rotate(4deg) scale(1.03)" },
      { transform: "rotate(-3deg) scale(1.04)" }, { transform: "rotate(0) scale(1.05)" }
    ], { duration: 360, easing: "ease-in-out", fill: "none" });
    const r = stage.getBoundingClientRect();
    const bx = r.left + r.width * 0.49, by = r.top + r.height * (game.kind === "sticks" ? 0.46 : 0.62);
    if (game.empty) {
      burst(bx, by, true, false); burst(bx, by - 10, true, false);
      poof.animate([{ opacity: 0, scale: 0.3 }, { opacity: 0.9, scale: 1, offset: 0.25 }, { opacity: 0, scale: 1.6 }], { duration: 1200, easing: "ease-out" });
      if (sound.on) { playSfx("crack"); playSfx("womp"); }
    } else {
      burst(bx, by, game.kind !== "sticks");
      if (sound.on) { playSfx(game.kind === "sticks" ? "snap" : "crack"); playSfx("sparkle"); }
    }
    flash.animate([{ opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, offset: 0.25 }, { opacity: 0, scale: 1.5 }], { duration: 650, easing: "ease-out" });
  }
  stage.classList.add("is-open");
  startCouncilIfDue(fortuneText());
  const halves = game.kind === "sticks" ? Promise.all([
    anim(stickU, [
      { transform: "none" },
      { transform: "translate(-1%, -3%) rotate(-3deg)", offset: 0.18 },
      { transform: "translate(-5%, -52%) rotate(-9deg)" }
    ], { duration: reduced ? 1 : 900, easing: ease }),
    anim(stickL, [
      { transform: "none" },
      { transform: "translate(1%, 3%) rotate(3deg)", offset: 0.18 },
      { transform: "translate(5%, 52%) rotate(7deg)" }
    ], { duration: reduced ? 1 : 900, easing: ease })
  ]) : Promise.all([
    anim(halfL, [
      { transform: "none", opacity: 1 },
      { transform: "translate(-2%, 0) rotate(-12deg)", offset: 0.18 },
      { transform: "translate(-21%, 16%) rotate(-24deg) scale(0.7)", opacity: 1 }
    ], { duration: reduced ? 1 : 950, easing: ease }),
    anim(halfR, [
      { transform: "none", opacity: 1 },
      { transform: "translate(2%, 0) rotate(12deg)", offset: 0.18 },
      { transform: "translate(21%, 16%) rotate(24deg) scale(0.7)", opacity: 1 }
    ], { duration: reduced ? 1 : 950, easing: ease })
  ]);
  game.slipShown = !game.empty;
  if (!game.empty) startSlotsIfDue(fortuneText());
  const slipIn = game.empty ? Promise.resolve() : anim(slip, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
    { opacity: 0, transform: "translateY(18%) scale(0.06, 0.45)" },
    { opacity: 1, transform: "translateY(4%) scale(0.22, 0.7)", offset: 0.3 },
    { opacity: 1, transform: "translateY(0) scale(1.03, 1)", offset: 0.82 },
    { opacity: 1, transform: "translateY(0) scale(1, 1)" }
  ], { duration: reduced ? 250 : 900, delay: reduced ? 0 : 180, easing: ease });
  await Promise.all([halves, slipIn]);
  landSlots();
  if (fortuneText() === CALL) { game.forceCall = false; scheduleCall(); }
  if (SPECIAL.missingPerson.test(fortuneText())) game.forceCall = true;
  if (SPECIAL.believe.test(fortuneText()) && sound.on) playSfx("believe");
  startFbiIfDue(fortuneText());
  startVictorianIfDue(fortuneText());
  stage.setAttribute("aria-label", "Get another fortune cookie");
  hint.textContent = game.empty ? "Empty. Tap for another one" : "Tap for another one";
  game.state = "open";
}

async function newCookie(): Promise<void> {
  const reduced = reducedMotion();
  endSlots();
  // "I want to believe": the cookie gets abducted instead of fading out
  const abducting = game.slipShown && SPECIAL.believe.test(fortuneText());
  if (abducting) await abduct();
  else await Promise.all([
    game.slipShown ? anim(slip, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-30%) scale(0.92)" }], { duration: 320, easing: "ease-in" }) : null,
    ...[halfL, halfR, stickU, stickL].map((el) => anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 280 }))
  ]);
  if (game.crushed) await clearCrush();
  // forwards-filled animations from the last round would otherwise stick
  [halfL, halfR, stickU, stickL, slip].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  slip.style.opacity = "0";
  endCouncil(); endFbi(); endVictorian();
  stage.classList.remove("is-open");
  pickKind();
  loadFortune();
  if (abducting) endAbduction();
  await anim(game.kind === "sticks" ? sticks : cookie, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
    { transform: "scale(0)", opacity: 0 }, { transform: "scale(1.08)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }
  ], { duration: reduced ? 200 : 460, easing: "cubic-bezier(.3,.7,.4,1.2)", fill: "none" });
  showKind();   // restore the closed-state label and hint
  game.state = "closed";
}

/**
 * Debug: make the next round `s`. A closed cookie is swapped in place, an open one is
 * replaced by a fresh round; mid-transition, it waits for the next round. Returns true
 * if it applied now.
 */
export async function forceRound(s: RoundSetup): Promise<boolean> {
  setup = s;
  if (game.busy) return false;
  if (game.state === "closed") { pickKind(); loadFortune(); return true; }
  game.busy = true;
  try { await newCookie(); } finally { game.busy = false; }
  return true;
}

/** Real / Crude toggle, persisted. */
export function initModeToggle(): void {
  game.mode = store.get("fc-mode") === "real" ? "real" : "crude";
  $<HTMLInputElement>("#mode-" + game.mode).checked = true;
  document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((r) => r.addEventListener("change", () => {
    game.mode = r.value as Mode; store.set("fc-mode", game.mode);
    if (game.state === "closed") loadFortune();
  }));
}

export function initStage(): void {
  stage.addEventListener("click", async () => {
    if (consumeSuppressedClick()) return;
    if (game.busy) return;
    game.busy = true;
    try {
      if (game.state === "closed") await openCookie(); else await newCookie();
    } finally {
      game.busy = false;
    }
  });
}
