<script lang="ts">
import { css } from "styled-system/css";
import Header from "$lib/components/Header.svelte";
import ControlsPanel from "$lib/components/ControlsPanel.svelte";
import NumberControl from "$lib/components/NumberControl.svelte";
import SliderControl from "$lib/components/SliderControl.svelte";
import SelectControl from "$lib/components/SelectControl.svelte";
import SegmentedControl from "$lib/components/SegmentedControl.svelte";
import EngineControls from "$lib/components/EngineControls.svelte";
import ImageGrid from "$lib/components/ImageGrid.svelte";
import { generateImages } from "$lib/images";
import { engines, getEngine } from "$lib/engines/registry";
import { buildDefaultParams } from "$lib/engines/types";
import type { ImageFit } from "$lib/engines/types";
import { useElementSize } from "$lib/composables/use-element-size.svelte";

let imageCountStr = $state("40");
let gap = $state([4]);
let imageFit = $state<string>("cover");
let engineId = $state("justified");

let engine = $derived(getEngine(engineId));
let engineParams = $state<Record<string, unknown>>({});

$effect(() => {
	engineParams = buildDefaultParams(engine.controls);
});

let imageCount = $derived.by(() => {
	const v = parseInt(imageCountStr, 10);
	return !isNaN(v) && v >= 1 && v <= 200 ? v : 40;
});

let images = $derived(generateImages(imageCount));

const topSection = useElementSize();

let windowHeight = $state(
	typeof window !== "undefined" ? window.innerHeight : 800,
);

$effect(() => {
	function onResize() {
		windowHeight = window.innerHeight;
	}
	window.addEventListener("resize", onResize);
	return () => window.removeEventListener("resize", onResize);
});

const verticalPadding = 24 + 16; // py-6 (24px) + gap below controls
let availableHeight = $derived(
	Math.max(200, windowHeight - (topSection.height ?? 0) - verticalPadding),
);

function handleParamChange(key: string, value: unknown) {
	engineParams = { ...engineParams, [key]: value };
}

let engineItems = engines.map((e) => ({ value: e.id, label: e.name }));

const fitOptions = [
	{
		label: "Cover",
		value: "cover",
		icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2.5" width="7" height="7" rx="1" opacity="0.35"/><path d="M0 0h3v1.5H1.5V3H0zM12 0H9v1.5h1.5V3H12zM0 12V9h1.5v1.5H3V12zM12 12V9h-1.5v1.5H9V12z"/></svg>`,
	},
	{
		label: "Stretch",
		value: "stretch",
		icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="3" y="3" width="6" height="6" rx="0.75"/><rect x="5" y="0" width="2" height="3" rx="0.5"/><rect x="5" y="9" width="2" height="3" rx="0.5"/><rect x="0" y="5" width="3" height="2" rx="0.5"/><rect x="9" y="5" width="3" height="2" rx="0.5"/></svg>`,
	},
	{
		label: "Contain",
		value: "contain",
		icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path fill-rule="evenodd" d="M1.5 0A1.5 1.5 0 000 1.5v9A1.5 1.5 0 001.5 12h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 0h-9zM1.5 1.5h9v9h-9v-9z"/><rect x="3.5" y="2.5" width="5" height="7" rx="0.5"/></svg>`,
	},
];
</script>

<div class={css({ maxWidth: '1400px', mx: 'auto', px: '8', py: '6' })}>
	<div bind:this={topSection.element}>
		<Header title="Gridpack" subtitle="image layout algorithms" />

		<div class={css({ mb: '3', px: '4' })}>
			<SegmentedControl bind:value={engineId} items={engineItems} />
		</div>

		<ControlsPanel>
			<NumberControl label="Images" bind:value={imageCountStr} min={1} max={200} />
			<SliderControl label="Gap" bind:value={gap} min={0} max={16} step={1} wide />
			<SelectControl label="Fit Mode" bind:value={imageFit} options={fitOptions} />
			<EngineControls
				controls={engine.controls}
				params={engineParams}
				onchange={handleParamChange}
			/>
		</ControlsPanel>
	</div>

	<ImageGrid
		{images}
		{engine}
		params={engineParams}
		gap={gap[0]}
		fit={imageFit as ImageFit}
		containerHeight={engine.containerMode === 'fill' ? availableHeight : undefined}
	/>
</div>
