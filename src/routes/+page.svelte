<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';
	import NumberControl from '$lib/components/NumberControl.svelte';
	import SliderControl from '$lib/components/SliderControl.svelte';
	import ImageGrid from '$lib/components/ImageGrid.svelte';
	import { generateImages } from '$lib/images';

	let imageCountStr = $state('40');
	let rowHeight = $state([220]);
	let gap = $state([4]);

	let imageCount = $derived.by(() => {
		const v = parseInt(imageCountStr, 10);
		return !isNaN(v) && v >= 1 && v <= 200 ? v : 40;
	});

	let images = $derived(generateImages(imageCount));
</script>

<div class="max-w-1400px mx-auto px-8 py-6">
	<Header title="Gridpack" subtitle="justified image layout demo" />

	<ControlsPanel>
		<NumberControl label="Images" bind:value={imageCountStr} min={1} max={200} />
		<SliderControl label="Row Height" bind:value={rowHeight} min={100} max={400} step={10} wide />
		<SliderControl label="Gap" bind:value={gap} min={0} max={16} step={1} wide />
	</ControlsPanel>

	<ImageGrid {images} targetRowHeight={rowHeight[0]} gap={gap[0]} />
</div>
