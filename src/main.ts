import "./styles/main.css";
import { initCall } from "./events/call";
import { initCrush } from "./events/crush";
import { initRage } from "./events/rage";
import { initParticles } from "./particles";
import { initSoundToggle } from "./sound";
import { initModeToggle, initStage, loadFortune, pickKind } from "./stage";

// Same setup order as the original inline script (rage's pointerdown runs before crush's).
initModeToggle();
initParticles();
initSoundToggle();
initCall();
initRage();
initCrush();
initStage();

pickKind();
loadFortune();

// ?debug shows a panel for forcing special rounds (loaded only when asked for)
if (new URLSearchParams(location.search).has("debug")) void import("./debug");
