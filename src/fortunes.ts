import data from "./data/fortunes.json";
import { random } from "./lib/random";
import { CALL } from "./specials";

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

/** Six unique numbers from 1 to 99. */
export function luckyNumbers(count = 6, max = 99): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(pool.splice(Math.floor(random() * pool.length), 1)[0]!);
  return out;
}
