/*
 * Play stats for the gimmicks that judge you: this visit and all time (persisted).
 * Also fills the {placeholders} some fortunes use.
 */
import { store } from "./lib/storage";

export interface Counts { cookies: number; rages: number; crushes: number; goldens: number; flies: number }
const KEY = "fc-stats";

function loadLifetime(): Counts & { since: number } {
  const out = { cookies: 0, rages: 0, crushes: 0, goldens: 0, flies: 0, since: Date.now() };
  try {
    const saved = JSON.parse(store.get(KEY) ?? "null") as Record<string, unknown> | null;
    if (saved && typeof saved === "object") {
      for (const k of Object.keys(out) as (keyof typeof out)[]) {
        const v = Number(saved[k]);
        if (Number.isFinite(v) && v >= 0) out[k] = v;
      }
    }
  } catch { /* corrupt or blocked storage: start fresh */ }
  return out;
}

export const session: Counts & { start: number } = { cookies: 0, rages: 0, crushes: 0, goldens: 0, flies: 0, start: Date.now() };
export const lifetime = loadLifetime();

export function tally(what: keyof Counts): void {
  session[what]++; lifetime[what]++;
  store.set(KEY, JSON.stringify(lifetime));
}

const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Time on the page this visit, in words: "40 seconds", "6 minutes", "1.5 hours". */
export function wastedWords(): string {
  const s = Math.max(1, Math.round((Date.now() - session.start) / 1000));
  return s < 60 ? plural(s, "second") : s < 3600 ? plural(Math.round(s / 60), "minute") : `${(s / 3600).toFixed(1)} hours`;
}

/** Same, compact: "6m 12s". */
export function wastedShort(): string {
  const s = Math.max(1, Math.round((Date.now() - session.start) / 1000));
  return s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor(s / 60) % 60}m`;
}

/**
 * Fill a fortune's placeholders: {time} the local time, {count} this visit's cookies
 * counting the one being opened ("14 cookies"), {wasted} time on the page.
 */
export function fillTemplate(text: string): string {
  if (!text.includes("{")) return text;
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key === "time" ? new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : key === "count" ? plural(session.cookies + 1, "cookie")
    : key === "wasted" ? wastedWords()
    : whole);
}
