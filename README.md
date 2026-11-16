# Crude Fortunes

A gag fortune cookie app. Tap the cookie, it cracks open, crumbs fly, and an unserious fortune unrolls with lucky numbers. Red hongbao background, gold trim, drifting clouds.

Everything lives in one static `index.html` (images are inlined, music and sound effects are generated in the browser with the Web Audio API), so it deploys to Vercel as-is with no build step.

## Features
- **Real / Crude** fortune modes
- **Chopsticks** (1 in 10): split them for an extra-crude fortune
- **Empty cookie** (1 in 25): no slip, just a sad poof
- **Hold to crush**: press and hold to crush the cookie into a ruined paper ball
- **Rage mode**: tap 6 times fast and the cookie insults your impatience
- **Special fortunes**: The Council (dark mode, 6 6 6 6 6 6), the call from inside the house (fake incoming call, set up by "missing person"), Mercury in retrograde (upside-down cookie), "no fortune" (? lucky numbers)
- Background music and sound effects with a Sound on/off toggle

## Editing fortunes
The `FORTUNES` object at the top of the main `<script>` in `index.html` holds the `real`, `crude`, `sticks` and `rage` lists.

## Deploy
Import the repo in Vercel as a static site (framework preset: Other, no build command, output directory `.`).
