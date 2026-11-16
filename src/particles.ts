/* Crumbs and gold sparkles on a full-screen canvas. */
import { $ } from "./lib/dom";
import { pick, rand } from "./lib/random";

interface Crumb {
  k: "crumb"; x: number; y: number; vx: number; vy: number;
  r: number; rot: number; vr: number; c: string; pts: number[]; born: number;
}
interface Spark {
  k: "spark"; x: number; y: number; vx: number; vy: number;
  r: number; life: number; ph: number; born: number;
}

const cvs = $<HTMLCanvasElement>("canvas.fx");
const ctx = cvs.getContext("2d")!;
let W = 0, H = 0, dpr = 1, parts: (Crumb | Spark)[] = [], running = false;

function resize(): void {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cvs.width = W * dpr; cvs.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initParticles(): void {
  resize(); addEventListener("resize", resize);
}

const crumbCols = ["#F2C27A", "#E9A44F", "#D88A35", "#B9722A", "#F7D9A4"];

export function burst(x: number, y: number, crumbs = true, sparks = true, n = 30): void {
  for (let i = 0; i < (crumbs ? n : 0); i++) {
    const pts = Array.from({ length: 6 }, () => rand(0.55, 1));
    parts.push({ k: "crumb", x: x + rand(-24, 24), y: y + rand(-8, 18), vx: rand(-2.8, 2.8), vy: rand(-4.5, 0.5),
      r: rand(1.8, 4.6), rot: rand(0, 6.28), vr: rand(-0.25, 0.25), c: pick(crumbCols), pts, born: performance.now() });
  }
  for (let i = 0; i < (sparks ? 26 : 0); i++) {
    const a = rand(0, Math.PI * 2), s = rand(3, 9);
    parts.push({ k: "spark", x, y: y - 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5,
      r: rand(3, 7.5), life: rand(700, 1200), ph: rand(0, 6.28), born: performance.now() });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function star(r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 ? r * 0.28 : r, a = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

function tick(now: number): void {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter((p) => {
    const age = now - p.born;
    if (p.k === "crumb") {
      p.vy += 0.34; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 20) return false;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath();
      p.pts.forEach((m, i) => { const a = (i / p.pts.length) * Math.PI * 2; ctx.lineTo(Math.cos(a) * p.r * m, Math.sin(a) * p.r * m); });
      ctx.closePath(); ctx.fillStyle = p.c; ctx.fill();
      ctx.restore();
      return true;
    }
    const t = age / p.life;
    if (t >= 1) return false;
    p.vx *= 0.9; p.vy = p.vy * 0.9 + 0.06; p.x += p.vx; p.y += p.vy;
    const tw = 0.65 + 0.35 * Math.sin(p.ph + age / 55);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(age / 400);
    ctx.globalAlpha = (1 - t) * tw;
    ctx.shadowColor = "rgba(255, 214, 110, 0.9)"; ctx.shadowBlur = 10;
    star(p.r * (1 - t * 0.4)); ctx.fillStyle = "#FDE9A6"; ctx.fill();
    ctx.restore();
    return true;
  });
  if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, W, H); }
}
