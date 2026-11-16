/*
 * "I want to believe": tapping for the next cookie gets this one abducted. A saucer
 * swoops in, beams up the cookie halves and the slip, and zips off.
 * Only translate/scale/opacity are animated: Safari crops a filter under a rotation.
 */
import { playSfx } from "../audio/sfx";
import { bob, slipPos, stage } from "../elements";
import { anim, reducedMotion } from "../lib/dom";
import { sound } from "../sound";

const layer = document.createElement("div");
layer.className = "abduct";
layer.setAttribute("aria-hidden", "true");
layer.hidden = true;
layer.innerHTML = `
  <div class="beam"></div>
  <svg class="ufo" viewBox="0 0 120 56">
    <defs>
      <linearGradient id="ufoHull" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FCEBB0"/><stop offset="0.5" stop-color="#E3B54C"/><stop offset="1" stop-color="#A8761C"/>
      </linearGradient>
      <radialGradient id="ufoDome" cx="0.4" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#F2FFF6" stop-opacity="0.95"/><stop offset="1" stop-color="#9FE8C0" stop-opacity="0.55"/>
      </radialGradient>
    </defs>
    <path d="M37 30 a23 21 0 0 1 46 0 z" fill="url(#ufoDome)" stroke="#A8761C" stroke-width="1.2"/>
    <ellipse cx="60" cy="40" rx="24" ry="7" fill="#7E0818"/>
    <ellipse cx="60" cy="33" rx="57" ry="12" fill="url(#ufoHull)" stroke="#A8761C" stroke-width="1.2"/>
    <g class="ufo-lights" fill="#E9FFE8">
      <circle cx="22" cy="34" r="2.6"/><circle cx="41" cy="37" r="2.6"/><circle cx="60" cy="38" r="2.6"/>
      <circle cx="79" cy="37" r="2.6"/><circle cx="98" cy="34" r="2.6"/>
    </g>
  </svg>`;
stage.append(layer);
const beam = layer.querySelector<HTMLElement>(".beam")!;
const ufo = layer.querySelector<SVGSVGElement>(".ufo")!;

/** Plays the abduction; the cookie and slip are left invisible until endAbduction(). */
export async function abduct(): Promise<void> {
  const reduced = reducedMotion();
  layer.hidden = false;
  if (sound.on) playSfx("abduct");
  const fade = (el: Element, from: number, to: number, duration: number) => anim(el, [{ opacity: from }, { opacity: to }], { duration });
  if (reduced) {
    await Promise.all([fade(ufo, 0, 1, 300), fade(beam, 0, 1, 300)]);
    await Promise.all([fade(bob, 1, 0, 500), fade(slipPos, 1, 0, 500)]);
    await Promise.all([fade(ufo, 1, 0, 300), fade(beam, 1, 0, 300)]);
  } else {
    // swoop in from the top right
    await anim(ufo, [
      { opacity: 0, transform: "translate(150%, -150%) scale(0.5)" },
      { opacity: 1, transform: "translate(-10%, 8%) scale(1.04)", offset: 0.75 },
      { opacity: 1, transform: "none" }
    ], { duration: 650, easing: "cubic-bezier(.2,.8,.3,1)" });
    const hover = ufo.animate([{ transform: "none" }, { transform: "translateY(-5%)" }], { duration: 300, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
    await anim(beam, [{ opacity: 0, transform: "scaleY(0.1)" }, { opacity: 1, transform: "scaleY(1)" }], { duration: 300, easing: "ease-out" });
    // up, up and away
    await Promise.all([
      // a little hop as the beam catches them, a steady float up, shrinking into the saucer
      anim(bob, [
        { transform: "none", opacity: 1 },
        { transform: "translateY(-5%) scale(0.97)", opacity: 1, offset: 0.15 },
        { transform: "translateY(-52%) scale(0.45)", opacity: 1, offset: 0.75 },
        { transform: "translateY(-75%) scale(0.08)", opacity: 0 }
      ], { duration: 1400, easing: "cubic-bezier(.4,0,.6,1)" }),
      anim(slipPos, [
        { transform: "none", opacity: 1 },
        { transform: "translateY(-10%) scale(0.96)", opacity: 1, offset: 0.15 },
        { transform: "translateY(-115%) scale(0.4)", opacity: 1, offset: 0.75 },
        { transform: "translateY(-160%) scale(0.05)", opacity: 0 }
      ], { duration: 1300, delay: 100, easing: "cubic-bezier(.4,0,.6,1)" })
    ]);
    hover.cancel();
    await Promise.all([
      fade(beam, 1, 0, 200),
      anim(ufo, [
        { transform: "none", opacity: 1 },
        { transform: "translate(-6%, 10%)", opacity: 1, offset: 0.25 },
        { transform: "translate(-260%, -240%) scale(0.35)", opacity: 0 }
      ], { duration: 450, easing: "cubic-bezier(.6,0,.9,.4)" })
    ]);
  }
  [ufo, beam].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  layer.hidden = true;
}

/** Call once the next round is loaded, right before it pops in: brings the stage back. */
export function endAbduction(): void {
  [bob, slipPos].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
}
