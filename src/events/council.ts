/* "The Council demands a sacrifice.": the page goes dark and ominous until the next round. */
import { playSfx } from "../audio/sfx";
import { sound } from "../sound";
import { SPECIAL } from "../specials";

export function startCouncilIfDue(fortune: string): void {
  if (SPECIAL.council.test(fortune)) {
    document.body.classList.add("ominous");
    if (sound.on) playSfx("doom");
  }
}

export function endCouncil(): void {
  document.body.classList.remove("ominous");
}
