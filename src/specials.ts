/*
 * Special fortunes are recognised by their text. If you reword one of these in
 * data/fortunes.json, update the pattern here too; the build fails if a pattern
 * no longer matches any fortune (see vite.config.ts).
 */

/** Only ever shown as the follow-up to "missing person"; never drawn at random. */
export const CALL = "The call is coming from inside the house.";

export const SPECIAL = {
  /** Dark, ominous page; lucky numbers 6 6 6 6 6 6. */
  council: /Council demands a sacrifice/,
  /** The cookie appears upside down before opening. */
  retrograde: /Mercury is in retrograde/,
  /** Lucky numbers ? ? ? ? ? ?. */
  noFortune: /contain no fortune/,
  /** Forces the next round to be the CALL fortune. */
  missingPerson: /become a missing person/i,
  /** Plays a spooky sci-fi jingle when the slip lands. */
  believe: /I want to believe/,
  /** A security-camera REC overlay; the seal grows eyes that follow your finger. */
  fbi: /The FBI is watching/,
  /** Sepia, film grain and a music-box version of the tune. */
  victorian: /Victorian child/,
  /** A red DENIED / REJECTED / IGNORED rubber stamp slams onto the slip. */
  stamped: /(has|have) been (reviewed|processed|forwarded)/,
  /** A finger pokes out of the cookie; tapping pulls it. You know what happens. */
  finger: /^Pull my finger\./,
} as const;

/** True for the call and any fortune that triggers a special event. */
export const isSpecial = (fortune: string): boolean =>
  fortune === CALL || Object.values(SPECIAL).some((pattern) => pattern.test(fortune));
