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
	{ label: "Cover", value: "cover" },
	{ label: "Stretch", value: "stretch" },
	{ label: "Contain", value: "contain" },
];
</script>

<div class={css({ maxWidth: '1400px', mx: 'auto', px: '8', py: '6' })}>
	<div bind:this={topSection.element}>
		<Header title="Gridpack" subtitle="image layout algorithms" />

		<ControlsPanel>
			<SegmentedControl bind:value={engineId} items={engineItems} />
		</ControlsPanel>

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
