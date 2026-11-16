/* The "Sound on/off" toggle (music + effects), persisted. Music starts on the first open. */
import { startMusic, stopMusic } from "./audio/music";
import { $ } from "./lib/dom";
import { store } from "./lib/storage";

export const sound = {
  on: store.get("fc-music") !== "off",
  /** Becomes true on the first cookie open or crush (autoplay rules). */
  started: false,
};

export function startMusicOnce(): void {
  if (!sound.started) { sound.started = true; if (sound.on) startMusic(); }
}

export function initSoundToggle(): void {
  const musicBtn = $<HTMLButtonElement>(".music");
  const sync = (): void => {
    musicBtn.setAttribute("aria-pressed", String(sound.on));
    musicBtn.querySelector("span")!.textContent = sound.on ? "Sound on" : "Sound off";
  };
  sync();
  musicBtn.addEventListener("click", () => {
    sound.on = !sound.on; store.set("fc-music", sound.on ? "on" : "off"); sync();
    if (sound.on && sound.started) startMusic(); else stopMusic();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopMusic(); else if (sound.on && sound.started) startMusic();
  });
}
