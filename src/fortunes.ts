import data from "./data/fortunes.json";
import { random } from "./lib/random";
import { CALL, isSpecial } from "./specials";

export type List = keyof typeof data;
export type Mode = "real" | "crude";

const FORTUNES: Record<List, readonly string[]> = data;

/* Shuffle bags, so nothing repeats until the list runs out. */
const bags: Record<List, string[]> = { real: [], crude: [], sticks: [], rage: [] };

export function draw(list: List): string {
  if (!bags[list].length) {
    const bag = FORTUNES[list].filter((f) => f !== CALL);   // the call only comes as a follow-up
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [bag[i], bag[j]] = [bag[j]!, bag[i]!];
    }
    bags[list] = bag;
  }
  return bags[list].pop() ?? "";
}

/** Like draw(), but skips special fortunes (put back for later), for the golden cookie. */
export function drawPlain(list: List): string {
  for (let tries = FORTUNES[list].length; tries > 0; tries--) {
    const f = draw(list);
    if (!isSpecial(f)) return f;
    bags[list].unshift(f);
  }
  return draw(list);
}

/** First fortune in any list matching `pattern` (for the debug panel). */
export function findFortune(pattern: RegExp): string | undefined {
  return Object.values(FORTUNES).flat().find((f) => pattern.test(f));
}

/** Six unique numbers from 1 to 99. */
export function luckyNumbers(count = 6, max = 99): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(pool.splice(Math.floor(random() * pool.length), 1)[0]!);
  return out;
}
