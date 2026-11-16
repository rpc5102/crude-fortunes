import { defineConfig, type Plugin } from "vite";
import fortunes from "./src/data/fortunes.json";
import { SPECIAL } from "./src/specials";

/** Fail the build if a special fortune was reworded and its event would silently stop working. */
function checkFortunes(): Plugin {
  return {
    name: "check-fortunes",
    buildStart() {
      const all = Object.values(fortunes).flat();
      for (const [name, pattern] of Object.entries(SPECIAL)) {
        if (!all.some((f) => pattern.test(f))) {
          this.error(`No fortune in src/data/fortunes.json matches the "${name}" special (${pattern}). Update src/specials.ts.`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [checkFortunes()],
  build: {
    // one entry chunk, nothing to preload
    modulePreload: { polyfill: false },
  },
});
