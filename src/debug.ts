/*
 * Debug panel, shown with ?debug in the URL (works on deployed builds too, e.g. on a phone).
 * Each case sets up the cookie for that special round; tap the cookie to play it.
 */
import "./styles/debug.css";
import { rage } from "./events/rage";
import { findFortune } from "./fortunes";
import { game } from "./game";
import { CALL, SPECIAL } from "./specials";
import { forceRound, type RoundSetup } from "./stage";

const CASES: [label: string, setup: RoundSetup][] = [
  ["The Council", { fortune: findFortune(SPECIAL.council) }],
  ["Mercury retrograde", { fortune: findFortune(SPECIAL.retrograde) }],
  ["No fortune (???)", { fortune: findFortune(SPECIAL.noFortune) }],
  ["Missing person", { fortune: findFortune(SPECIAL.missingPerson) }],
  ["The call", { fortune: CALL }],
  ["I want to believe", { fortune: findFortune(SPECIAL.believe) }],
  ["FBI watching", { fortune: findFortune(SPECIAL.fbi) }],
  ["Victorian child", { fortune: findFortune(SPECIAL.victorian) }],
  ["Golden cookie", { golden: true }],
  ["Stamp: DENIED", { fortune: findFortune(SPECIAL.stamped) }],
  ["Empty cookie", { empty: true }],
  ["Chopsticks", { kind: "sticks" }],
];

const root = document.createElement("div");
root.className = "debug";
root.innerHTML = `
  <button type="button" class="debug-toggle" aria-expanded="false" aria-controls="debug-panel">Debug</button>
  <div class="debug-panel" id="debug-panel" role="group" aria-label="Force a special round" hidden>
    <p class="debug-status" aria-live="polite">Pick a case, then tap the cookie.</p>
  </div>`;
const toggle = root.querySelector<HTMLButtonElement>(".debug-toggle")!;
const panel = root.querySelector<HTMLElement>(".debug-panel")!;
const status = root.querySelector<HTMLElement>(".debug-status")!;

const open = (on: boolean): void => { panel.hidden = !on; toggle.setAttribute("aria-expanded", String(on)); };
toggle.addEventListener("click", () => open(Boolean(panel.hidden)));

function button(label: string, onClick: () => void): void {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = label;
  b.addEventListener("click", onClick);
  panel.append(b);
}

for (const [label, setup] of CASES) {
  button(label, async () => {
    open(false);
    status.textContent = (await forceRound(setup)) ? `Ready: ${label}. Tap the cookie.` : `Queued: ${label} (next round).`;
  });
}
button("Rage now", () => {
  open(false);
  rage();
  status.textContent = game.state === "open" ? "Raged." : "Raged (shows when the cookie opens).";
});

document.body.append(root);
