import type { KnipConfig } from "knip";

export default {
	// tempo isn't a built-in knip plugin, so its config is an explicit entry
	// (this also makes @xevion/tempo resolve as a used dependency).
	entry: ["tempo.config.ts"],
	// SvelteKit scaffolding placeholder ($lib barrel) — intentionally empty.
	ignore: ["src/lib/index.ts"],
} satisfies KnipConfig;
