/* The call is coming from inside the house: a fake phone-style incoming call. */
import { duckMusic } from "../audio/music";
import { playSfx, ring } from "../audio/sfx";
import { stage } from "../elements";
import { $, vibrate } from "../lib/dom";
import { sound } from "../sound";

const call = $(".call"), callName = $(".call-name"), callSub = $(".call-sub"), callLabel = $(".call-label"),
      callCap = $(".call-caption"), btnDecline = $<HTMLButtonElement>(".call-btn.decline"),
      btnAccept = $<HTMLButtonElement>(".call-btn.accept"), btnEnd = $<HTMLButtonElement>(".call-btn.end"),
      callActions = $(".call-actions");
let callTimer = 0, callTick = 0, callbacks = 0;

/** Rings about 1.1s after the call fortune's slip lands. */
export function scheduleCall(): void {
  callbacks = 0;
  setTimeout(() => ringIn("Inside the House"), 1100);
}

function ringIn(name: string): void {
  callbacks++;
  callName.textContent = name; callLabel.textContent = "Incoming call"; callSub.textContent = "mobile"; callCap.textContent = "";
  btnDecline.hidden = btnAccept.hidden = false; btnEnd.hidden = true; callActions.classList.remove("one");
  call.hidden = false; call.classList.add("ringing");
  requestAnimationFrame(() => call.classList.add("show"));
  if (sound.on) { duckMusic(true); ring(true); }
  vibrate([500, 300, 500, 300, 500]);
  btnAccept.focus({ preventScroll: true });
  clearTimeout(callTimer); callTimer = window.setTimeout(() => hangUp("Missed call"), 18000);
}

function hangUp(msg: string): void {
  clearTimeout(callTimer); clearInterval(callTick);
  ring(false); call.classList.remove("ringing");
  callLabel.textContent = msg || "Call ended";
  btnDecline.hidden = btnAccept.hidden = btnEnd.hidden = true;
  setTimeout(() => {
    call.classList.remove("show");
    setTimeout(() => { call.hidden = true; if (sound.on) duckMusic(false); stage.focus({ preventScroll: true }); }, 350);
  }, msg ? 900 : 300);
}

export function initCall(): void {
  btnDecline.addEventListener("click", () => {
    clearTimeout(callTimer); ring(false);
    call.classList.remove("show");
    setTimeout(() => {
      call.hidden = true;
      // it calls back, once
      if (callbacks < 2) setTimeout(() => ringIn("Still Inside the House"), 1400);
      else if (sound.on) duckMusic(false);
    }, 350);
  });
  btnAccept.addEventListener("click", () => {
    clearTimeout(callTimer); ring(false); call.classList.remove("ringing");
    btnDecline.hidden = btnAccept.hidden = true; btnEnd.hidden = false; callActions.classList.add("one");
    callLabel.textContent = "Connected";
    let secs = 0; callSub.textContent = "00:00";
    callTick = window.setInterval(() => { secs++; callSub.textContent = "00:" + String(secs).padStart(2, "0"); }, 1000);
    callCap.textContent = "*heavy breathing*";
    if (sound.on) playSfx("breathe");
    setTimeout(() => { if (!call.hidden) callCap.textContent = "“Nice fortune.”"; }, 6900);
    clearTimeout(callTimer); callTimer = window.setTimeout(() => hangUp("Call ended"), 9000);
    btnEnd.focus({ preventScroll: true });
  });
  btnEnd.addEventListener("click", () => hangUp("Call ended"));
}
