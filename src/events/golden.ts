/*
 * Rare golden cookie (1 in 100): gold foil with a sweeping shine, a choir chord when it
 * opens, extra gold sparkles, a gold-edged slip and lucky numbers 7 7 7 7 7 7.
 * The gold is baked into a copy of the cookie image on a canvas, not a CSS filter:
 * the halves rotate as they split, and Safari clips filtered + rotated elements.
 */
import { cookie, halfL, halfR, stage } from "../elements";

const plainSrc = halfL.src;
let goldSrc: string | null = null;
let wanted = false;

// sweeping shine, masked to the cookie's shape (shown while the golden cookie is closed)
const shine = document.createElement("div");
shine.className = "shine";
shine.setAttribute("aria-hidden", "true");
cookie.append(shine);

async function bakeGold(): Promise<void> {
  try {
    await halfL.decode();
    const w = halfL.naturalWidth, h = halfL.naturalHeight;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(halfL, 0, 0);
    // gold hue and saturation, the cookie's own light and shade
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = "#D29A2E";
    ctx.fillRect(0, 0, w, h);
    // deepen the shadows toward amber, so it reads as metal rather than lemon
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(196, 128, 36, 0.45)";
    ctx.fillRect(0, 0, w, h);
    // metallic banding: bright and dark streaks across the foil
    ctx.globalCompositeOperation = "overlay";
    const g = ctx.createLinearGradient(0, 0, w, h);
    [[0, "#FFF8DC"], [0.22, "#7A4E0C"], [0.4, "#FFF4C8"], [0.58, "#6E450A"], [0.78, "#FFEDB0"], [1, "#8A5A10"]]
      .forEach(([at, c]) => g.addColorStop(at as number, c as string));
    ctx.fillStyle = g; ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, w, h);
    // the blend modes painted the transparent corners too: keep only the cookie's shape
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(halfL, 0, 0);
    const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/webp", 0.92));
    if (!blob) return;
    goldSrc = URL.createObjectURL(blob);
    if (wanted) applyGolden(true);
  } catch { /* no canvas: golden rounds just keep the plain cookie */ }
}

export function initGolden(): void {
  void bakeGold();
}

/** Dress the cookie for a golden (or plain) round. */
export function applyGolden(on: boolean): void {
  wanted = on;
  stage.classList.toggle("golden", on);
  const src = on && goldSrc ? goldSrc : plainSrc;
  if (halfL.src !== src) { halfL.src = src; halfR.src = src; }
}
