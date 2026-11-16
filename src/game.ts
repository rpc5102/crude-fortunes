import type { Mode } from "./fortunes";

export type Kind = "cookie" | "sticks";

/** State shared by the stage and the special events. */
export const game = {
  state: "closed" as "closed" | "open",
  /** True while an open/new/crush transition runs; taps are ignored. */
  busy: false,
  kind: "cookie" as Kind,
  /** 1 in 25 cookies has no fortune. */
  empty: false,
  /** "missing person" sets up the next cookie as the phone call. */
  forceCall: false,
  slipShown: false,
  crushed: false,
  /** Rare golden cookie, 1 in 100. */
  golden: false,
  mode: "crude" as Mode,
};
