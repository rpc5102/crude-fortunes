/*
 * Gimmicks: special-fortune effects that hook into the round without the stage knowing
 * about each one. A gimmick is active for a round when its match() accepts the fortune.
 */
export interface Gimmick {
  /** True if this fortune triggers the gimmick. */
  match(fortune: string): boolean;
  /** The round is loaded and the cookie is still closed. */
  loaded?(fortune: string): void;
  /** A tap on the closed cookie. Return true to swallow it (the cookie stays shut). */
  tapClosed?(): boolean;
  /** The slip has landed. Long sequences must not block, and end() may cut them short. */
  landed?(fortune: string): void;
  /** A tap on the open cookie. Return true to swallow it (no new round yet). */
  tapOpen?(): boolean;
  /** The round is over or was replaced: undo everything. */
  end?(): void;
}

const all: Gimmick[] = [];
let active: Gimmick[] = [];

export function registerGimmick(g: Gimmick): void { all.push(g); }

/** Called when a round's fortune is loaded (cookie closed). */
export function loadGimmicks(fortune: string): void {
  endGimmicks();
  active = all.filter((g) => g.match(fortune));
  active.forEach((g) => g.loaded?.(fortune));
}

export function landGimmicks(fortune: string): void { active.forEach((g) => g.landed?.(fortune)); }

/** Offer a tap to the active gimmicks; true if one swallowed it. */
export function tapGimmick(state: "closed" | "open"): boolean {
  return active.some((g) => (state === "closed" ? g.tapClosed?.() : g.tapOpen?.()) ?? false);
}

export function endGimmicks(): void {
  const was = active;
  active = [];
  was.forEach((g) => g.end?.());
}
