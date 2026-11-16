# Crude Fortunes

A gag fortune cookie app. Tap the cookie, it cracks open, crumbs fly, and an unserious fortune unrolls with lucky numbers. Red hongbao background, gold trim, drifting clouds.

Built with Vite and vanilla TypeScript. Music and sound effects are synthesized in the browser with the Web Audio API; there are no audio files.

## Features
- **Real / Crude** fortune modes
- **Chopsticks** (1 in 10): split them for an extra-crude fortune
- **Empty cookie** (1 in 25): no slip, just a sad poof
- **Hold to crush**: press and hold to crush the cookie into a ruined paper ball
- **Rage mode**: tap 6 times fast and the cookie insults your impatience
- **Special fortunes**: The Council (dark mode, 6 6 6 6 6 6), the call from inside the house (fake incoming call, set up by "missing person"), Mercury in retrograde (upside-down cookie), "no fortune" (? lucky numbers), "I want to believe" (spooky sci-fi jingle)
- Background music and sound effects with a Sound on/off toggle

## Develop
```sh
npm install
npm run dev        # local dev server
npm run build      # type-check, then build to dist/
npm run preview    # serve the production build
```

## Debug mode
Add `?debug` to the URL (works on the deployed site too, e.g. on a phone). A **Debug** button appears top right; pick a case and tap the cookie to play it:
The Council, Mercury retrograde, No fortune, Missing person (then tap again for the call), The call, I want to believe, Empty cookie, Chopsticks, and Rage now.
Hold-to-crush needs no setup: hold any cookie.

## Editing fortunes
`src/data/fortunes.json` holds four lists:

| List     | Used for |
| -------- | -------- |
| `real`   | Real mode (placeholder text for now) |
| `crude`  | Crude mode |
| `sticks` | Chopsticks rounds |
| `rage`   | Rage mode |

Lists are drawn from a shuffle bag, so nothing repeats until a list runs out.

Special fortunes are recognised by their text, using the patterns in `src/specials.ts`. If you reword one, update its pattern too; `npm run build` fails if a pattern no longer matches any fortune. "The call is coming from inside the house." is never drawn at random; it only follows "Excellent time to become a missing person."

## Layout
```
index.html            markup (one screen)
src/main.ts           entry: wires everything up
src/stage.ts          round state machine: pick round type, load fortune, open, next round
src/fortunes.ts       shuffle bags and lucky numbers
src/specials.ts       special-fortune patterns
src/game.ts           shared round state
src/elements.ts       DOM references shared between modules
src/particles.ts      crumbs and sparkles canvas
src/sound.ts          Sound on/off toggle; music starts on the first open
src/audio/            Web Audio engine, music loop, sound effects
src/events/           council, call, rage, crush
src/debug.ts          ?debug panel (loaded only when asked for)
src/styles/           CSS, imported in cascade order from main.css
src/assets/           cookie, chopsticks and cloud tile images
```

## Deploy
Vercel builds it with the Vite preset (`vercel.json` sets the build command and `dist` output, overriding any dashboard settings). Hashed files under `/assets` are served with a one-year immutable cache.
