export function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export const ease = "cubic-bezier(.2,.75,.25,1)";

/** WAAPI with fill: "forwards" by default. Callers must cancel these when a round resets. */
export const anim = (el: Element, keyframes: Keyframe[], opts: KeyframeAnimationOptions): Promise<Animation> =>
  el.animate(keyframes, { fill: "forwards", ...opts }).finished;

export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** navigator.vibrate is missing on iOS; that is fine. */
export function vibrate(pattern: number | number[]): void {
  try {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {}
}
