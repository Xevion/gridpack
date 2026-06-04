<script lang="ts">
	// Named, developer-authored icons rendered as real SVG markup (no {@html}).
	// `fill="currentColor"` lets them inherit the control's text color.
	let { name }: { name: string } = $props();
</script>

{#if name === "cover"}
	<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
		<rect x="2.5" y="2.5" width="7" height="7" rx="1" opacity="0.35" />
		<path
			d="M0 0h3v1.5H1.5V3H0zM12 0H9v1.5h1.5V3H12zM0 12V9h1.5v1.5H3V12zM12 12V9h-1.5v1.5H9V12z"
		/>
	</svg>
{:else if name === "stretch"}
	<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
		<rect x="3" y="3" width="6" height="6" rx="0.75" />
		<rect x="5" y="0" width="2" height="3" rx="0.5" />
		<rect x="5" y="9" width="2" height="3" rx="0.5" />
		<rect x="0" y="5" width="3" height="2" rx="0.5" />
		<rect x="9" y="5" width="3" height="2" rx="0.5" />
	</svg>
{:else if name === "contain"}
	<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
		<path
			fill-rule="evenodd"
			d="M1.5 0A1.5 1.5 0 000 1.5v9A1.5 1.5 0 001.5 12h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 0h-9zM1.5 1.5h9v9h-9v-9z"
		/>
		<rect x="3.5" y="2.5" width="5" height="7" rx="0.5" />
	</svg>
{/if}
