<script lang="ts">
	import ControlsPanel from "$lib/components/ControlsPanel.svelte";
	import EngineControls from "$lib/components/EngineControls.svelte";
	import Header from "$lib/components/Header.svelte";
	import ImageGrid from "$lib/components/ImageGrid.svelte";
	import SegmentedControl from "$lib/components/SegmentedControl.svelte";
	import { useElementSize } from "$lib/composables/use-element-size.svelte";
	import { engines, getEngine } from "$lib/engines/registry";
	import { resolveParams } from "$lib/engines/types";
	import { datasetControls, renderControls, resolveGlobals } from "$lib/global-controls";
	import { generateImages } from "$lib/images";

	import { css } from "styled-system/css";

	let engineId = $state("justified");
	let engine = $derived(getEngine(engineId));

	// Shared globals (dataset + render) flow through the same descriptor pipeline
	// as engine controls; raw edits are resolved (clamped/validated/defaulted) for
	// both display and consumption.
	let globalRaw = $state<Record<string, unknown>>({});
	let globalParams = $derived(resolveGlobals(globalRaw));

	// The dataset seed lives outside the descriptor bag because Reseed is an action,
	// not a value: bumping it swaps every id, so the gallery hard-cuts to a fresh
	// random sample rather than morphing.
	let datasetSeed = $state(1);

	// Per-engine params, kept sticky across engine switches: each engine reads its
	// own slice, and resolveParams fills defaults so a never-touched engine still
	// gets a complete bag. No reset effect — switching back restores prior edits.
	let paramsByEngine = $state<Record<string, Record<string, unknown>>>({});
	let engineParams = $derived(resolveParams(engine.controls, paramsByEngine[engineId] ?? {}));

	let images = $derived(
		generateImages({
			count: globalParams.count,
			bias: globalParams.bias,
			spread: globalParams.spread,
			order: globalParams.order,
			seed: datasetSeed,
		}),
	);

	const topSection = useElementSize();

	let windowHeight = $state(typeof window !== "undefined" ? window.innerHeight : 800);

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
		if (key === "reseed") {
			datasetSeed = Math.floor(Math.random() * 1_000_000) + 1;
			return;
		}
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

<div class={css({ maxWidth: "1400px", mx: "auto", px: "8", py: "6" })}>
	<div bind:this={topSection.element}>
		<Header title="Gridpack" subtitle="image layout algorithms" />

		<div class={css({ mb: "3", px: "4" })}>
			<SegmentedControl bind:value={engineId} items={engineItems} />
		</div>

		<ControlsPanel>
			<EngineControls
				controls={datasetControls}
				params={globalParams}
				onchange={handleGlobalChange}
			/>
			<EngineControls
				controls={renderControls}
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
		containerHeight={engine.containerMode === "fill" ? availableHeight : undefined}
	/>
</div>
