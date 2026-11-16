/*
 * "Your bill has arrived.": a thermal receipt prints out, itemizing your actual session
 * (from stats.ts) and charging you for it.
 */
import { printerSound } from "../audio/sfx";
import { hint } from "../elements";
import { reducedMotion } from "../lib/dom";
import { sound } from "../sound";
import { SPECIAL } from "../specials";
import { lifetime, session, wastedShort } from "../stats";
import { registerGimmick } from "./registry";

const W = 32;
const row = (l: string, r: string): string => l + " ".repeat(Math.max(1, W - l.length - r.length)) + r;
const center = (s: string): string => " ".repeat(Math.max(0, Math.floor((W - s.length) / 2))) + s;
const rule = "-".repeat(W);

function receiptLines(): string[] {
  const lines = [
    center("CRUDE FORTUNES"),
    center("Est. whenever. Regrets since."),
    "",
    row("CUSTOMER SINCE", new Date(lifetime.since).toLocaleDateString()),
    row("SERVED BY", "A COOKIE"),
    rule,
    row("COOKIES THIS VISIT", String(session.cookies)),
    row("COOKIES, ALL TIME", String(lifetime.cookies)),
    row("TANTRUMS THROWN", String(lifetime.rages)),
    row("COOKIES MURDERED", String(lifetime.crushes)),
  ];
  if (lifetime.flies) lines.push(row("FLIES MURDERED", String(lifetime.flies)));
  if (lifetime.goldens) lines.push(row("GOLDEN COOKIES WASTED", String(lifetime.goldens)));
  lines.push(
    row("TIME WASTED", wastedShort()),
    rule,
    row("DIGNITY", "-100%"),
    row("EMOTIONAL DAMAGE", "0.00"),
    center("(on the house. you need it.)"),
    row("SUBTOTAL", "YOUR YOUTH"),
    row("TIP (MANDATORY)", "40%"),
    row("TOTAL", "YOUR SELF-RESPECT"),
    rule,
    center("*** CARD DECLINED ***"),
    center("Thank you for your patronage."),
    center("Please do not come again."),
  );
  return lines;
}

const slot = document.createElement("div");
slot.className = "receipt-slot";
slot.hidden = true;
const paper = document.createElement("div");
paper.className = "receipt";
const text = document.createElement("pre");
paper.append(text);
slot.append(paper);
document.body.append(slot);

let timer = 0;
const STEP = 0.09;   // seconds per printed line

registerGimmick({
  match: (f) => SPECIAL.bill.test(f),
  landed() {
    timer = window.setTimeout(() => {
      const lines = receiptLines();
      text.textContent = lines.join("\n");
      slot.hidden = false;
      const reduced = reducedMotion();
      // printed line by line, the paper feeding out as it goes
      paper.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { clipPath: "inset(0 0 100% 0)", transform: "translateY(-12px)" },
        { clipPath: "inset(0 0 0% 0)", transform: "none" }
      ], { duration: reduced ? 250 : lines.length * STEP * 1000, easing: reduced ? "ease" : `steps(${lines.length}, end)`, fill: "forwards" });
      if (sound.on) printerSound(lines.length, STEP);
      hint.textContent = "Payment is due immediately. You can't afford it.";
    }, 400);
  },
  end() {
    clearTimeout(timer);
    if (slot.hidden) return;
    // tear it off (no rotation: the slot has a drop-shadow filter, and Safari clips filter + rotation)
    const a = slot.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14%)" }], { duration: 220, easing: "ease-in" });
    a.finished.then(() => { slot.hidden = true; paper.getAnimations().forEach((x) => x.cancel()); }).catch(() => {});
  },
});
