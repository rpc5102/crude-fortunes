import { $ } from "./lib/dom";

export const page = $(".page");
export const stage = $<HTMLButtonElement>(".stage");
export const cookie = $(".cookie");
export const halfL = $<HTMLImageElement>(".half.left");
export const halfR = $<HTMLImageElement>(".half.right");
export const sticks = $(".sticks");
export const stickU = $<HTMLImageElement>(".stick.upper");
export const stickL = $<HTMLImageElement>(".stick.lower");
export const flash = $(".flash");
export const poof = $(".poof");
export const paperball = $<SVGSVGElement>(".paperball");
export const bob = $(".bob");
export const slip = $(".slip");
export const slipPos = $(".slip-pos");
export const fortuneEl = $(".fortune-text");
export const luckyEl = $(".lucky");
export const hint = $(".hint");

export const fortuneText = (): string => fortuneEl.textContent ?? "";
