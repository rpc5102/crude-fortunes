/*
 * "Victorian child": the screen goes sepia with film grain, flicker and a scratch,
 * and the music switches to a music box. Until the next round.
 * The overlays sit directly under <body> so their blend modes reach the whole page
 * (a parent with opacity or z-index would isolate them).
 */
import { setMusicVoice } from "../audio/music";
import { playSfx } from "../audio/sfx";
import { sound } from "../sound";
import { SPECIAL } from "../specials";

for (const part of ["tint", "vignette", "grain", "flicker", "scratch"]) {
  const el = document.createElement("div");
  el.className = `vic vic-${part}`;
  el.setAttribute("aria-hidden", "true");
  document.body.append(el);
}

let active = false;

export function startVictorianIfDue(fortune: string): void {
  if (active || !SPECIAL.victorian.test(fortune)) return;
  active = true;
  document.body.classList.add("victorian");
  setMusicVoice("musicbox");
  if (sound.on) playSfx("windup");
}

export function endVictorian(): void {
  if (!active) return;
  active = false;
  document.body.classList.remove("victorian");
  setMusicVoice("zither");
}
