<script lang="ts">
import { css } from "styled-system/css";
import Header from "$lib/components/Header.svelte";
import ControlsPanel from "$lib/components/ControlsPanel.svelte";
import SegmentedControl from "$lib/components/SegmentedControl.svelte";
import EngineControls from "$lib/components/EngineControls.svelte";
import ImageGrid from "$lib/components/ImageGrid.svelte";
import { generateImages } from "$lib/images";
import { engines, getEngine } from "$lib/engines/registry";
import { resolveParams } from "$lib/engines/types";
import { globalControls, resolveGlobals } from "$lib/global-controls";
import { useElementSize } from "$lib/composables/use-element-size.svelte";

let engineId = $state("justified");
let engine = $derived(getEngine(engineId));

// Shared globals (Images/Gap/Fit) flow through the same descriptor pipeline
// as engine controls; raw edits are resolved (clamped/validated/defaulted) for
// both display and consumption.
let globalRaw = $state<Record<string, unknown>>({});
let globalParams = $derived(resolveGlobals(globalRaw));

// Per-engine params, kept sticky across engine switches: each engine reads its
// own slice, and resolveParams fills defaults so a never-touched engine still
// gets a complete bag. No reset effect — switching back restores prior edits.
let paramsByEngine = $state<Record<string, Record<string, unknown>>>({});
let engineParams = $derived(
	resolveParams(engine.controls, paramsByEngine[engineId] ?? {}),
);

let images = $derived(generateImages(globalParams.count));

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

function handleGlobalChange(key: string, value: unknown) {
	globalRaw = { ...globalRaw, [key]: value };
}

function handleParamChange(key: string, value: unknown) {
	paramsByEngine = {
		...paramsByEngine,
		[engineId]: { ...(paramsByEngine[engineId] ?? {}), [key]: value },
	};
}

let engineItems = engines.map((e) => ({ value: e.id, label: e.name }));
</script>

<div class={css({ maxWidth: '1400px', mx: 'auto', px: '8', py: '6' })}>
	<div bind:this={topSection.element}>
		<Header title="Gridpack" subtitle="image layout algorithms" />

		<div class={css({ mb: '3', px: '4' })}>
			<SegmentedControl bind:value={engineId} items={engineItems} />
		</div>

		<ControlsPanel>
			<EngineControls
				controls={globalControls}
				params={globalParams}
				onchange={handleGlobalChange}
			/>
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
		gap={globalParams.gap}
		fit={globalParams.fit}
		containerHeight={engine.containerMode === 'fill' ? availableHeight : undefined}
	/>
</div>
