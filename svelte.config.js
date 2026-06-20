import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
	},
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({ fallback: "404.html" }),
		// GitHub Pages serves the site under /<repo>; the deploy workflow sets
		// BASE_PATH. `dev` keeps the base empty for local development and previews.
		paths: {
			base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
		},
		alias: {
			"styled-system": "./styled-system/*",
		},
	},
};

export default config;
