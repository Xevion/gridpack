<script lang="ts">
	import { Slider } from '@ark-ui/svelte/slider';
	import { NumberInput } from '@ark-ui/svelte/number-input';
	import { justifiedLayout } from '$lib/justified-layout';
	import { generateImages, imageUrl } from '$lib/images';

	let containerWidth = $state(0);
	let containerEl: HTMLDivElement | undefined = $state();

	let imageCountStr = $state('40');
	let rowHeightValue = $state([220]);
	let gapValue = $state([4]);

	let imageCount = $derived.by(() => {
		const v = parseInt(imageCountStr, 10);
		return !isNaN(v) && v >= 1 && v <= 200 ? v : 40;
	});

	let images = $derived(generateImages(imageCount));
	let layout = $derived(
		containerWidth > 0
			? justifiedLayout(images, containerWidth, rowHeightValue[0], gapValue[0])
			: null
	);

	$effect(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver((entries) => {
			containerWidth = entries[0].contentRect.width;
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});
</script>

<div class="page">
	<header class="header">
		<h1 class="title">Gridpack</h1>
		<p class="subtitle">justified image layout demo</p>
	</header>

	<div class="controls-panel">
		<div class="control-group">
			<NumberInput.Root class="number-input" bind:value={imageCountStr} min={1} max={200}>
				<NumberInput.Label class="control-label">Images</NumberInput.Label>
				<NumberInput.Control class="number-input-control">
					<NumberInput.DecrementTrigger class="number-btn number-btn-left">
						&minus;
					</NumberInput.DecrementTrigger>
					<NumberInput.Input class="number-field" />
					<NumberInput.IncrementTrigger class="number-btn number-btn-right">
						+
					</NumberInput.IncrementTrigger>
				</NumberInput.Control>
			</NumberInput.Root>
		</div>

		<div class="control-group control-group-wide">
			<Slider.Root class="slider" bind:value={rowHeightValue} min={100} max={400} step={10}>
				<div class="slider-header">
					<Slider.Label class="control-label">Row Height</Slider.Label>
					<Slider.ValueText class="slider-value-text" />
				</div>
				<Slider.Control class="slider-control">
					<Slider.Track class="slider-track">
						<Slider.Range class="slider-range" />
					</Slider.Track>
					<Slider.Thumb index={0} class="slider-thumb">
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
			</Slider.Root>
		</div>

		<div class="control-group control-group-wide">
			<Slider.Root class="slider" bind:value={gapValue} min={0} max={16} step={1}>
				<div class="slider-header">
					<Slider.Label class="control-label">Gap</Slider.Label>
					<Slider.ValueText class="slider-value-text" />
				</div>
				<Slider.Control class="slider-control">
					<Slider.Track class="slider-track">
						<Slider.Range class="slider-range" />
					</Slider.Track>
					<Slider.Thumb index={0} class="slider-thumb">
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
			</Slider.Root>
		</div>
	</div>

	<div bind:this={containerEl} class="grid-container" style:height="{layout?.totalHeight ?? 0}px">
		{#if layout}
			{#each layout.items as item (item.id)}
				<div
					class="image-frame"
					style="left:{item.x}px;top:{item.y}px;width:{item.width}px;height:{item.height}px"
				>
					<img
						src={imageUrl(item.id, item.width, item.height)}
						alt="Photo {item.id}"
						loading="lazy"
						class="image"
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px 32px;
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.title {
		font-family: 'Playfair Display Variable', Georgia, serif;
		font-size: 42px;
		font-weight: 700;
		color: #3a3226;
		margin: 0;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
	}

	.subtitle {
		font-size: 14px;
		color: #8a7e6e;
		margin: 4px 0 0;
		letter-spacing: 0.5px;
	}

	.controls-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: flex-end;
		padding: 18px 22px;
		margin-bottom: 24px;
		background: linear-gradient(to bottom, #d9d0c2, #e2dace);
		border-radius: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.6);
		border-left: 1px solid rgba(255, 255, 255, 0.4);
		border-right: 1px solid #b5a994;
		border-bottom: 1px solid #a89a84;
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.18),
			inset 0 0 0 1px rgba(0, 0, 0, 0.04),
			0 1px 0 rgba(255, 255, 255, 0.6),
			0 2px 4px rgba(0, 0, 0, 0.08);
	}

	.control-group {
		min-width: 130px;
	}

	.control-group-wide {
		min-width: 200px;
		flex: 1;
	}

	:global(.control-label) {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: #5a5042;
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	:global(.slider-header) {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	:global(.slider-value-text) {
		font-size: 12px;
		font-weight: 600;
		color: #5a5042;
		font-variant-numeric: tabular-nums;
	}

	:global(.number-input-control) {
		display: flex;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid #9e9282;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 1px 1px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(.number-btn) {
		width: 34px;
		height: 32px;
		border: none;
		font-size: 18px;
		font-weight: 700;
		line-height: 1;
		color: #fff;
		cursor: pointer;
		background: linear-gradient(to bottom, #918577 0%, #736859 50%, #6e6356 100%);
		text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	:global(.number-btn:hover) {
		background: linear-gradient(to bottom, #a19586, #837869);
	}

	:global(.number-btn:active) {
		background: linear-gradient(to bottom, #6e6356, #918577);
		box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.3);
	}

	:global(.number-btn-left) {
		border-right: 1px solid rgba(0, 0, 0, 0.2);
	}

	:global(.number-btn-right) {
		border-left: 1px solid rgba(0, 0, 0, 0.2);
	}

	:global(.number-field) {
		width: 56px;
		height: 32px;
		text-align: center;
		border: none;
		font-size: 14px;
		font-family: 'Source Sans Pro', sans-serif;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #3a3226;
		background: linear-gradient(to bottom, #ebe5db, #f8f4ee);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12);
		outline: none;
	}

	:global(.number-field:focus) {
		background: linear-gradient(to bottom, #e5dfd5, #f5f0e8);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(90, 120, 160, 0.3);
	}

	:global(.slider-control) {
		position: relative;
		display: flex;
		align-items: center;
		height: 20px;
	}

	:global(.slider-track) {
		flex: 1;
		height: 8px;
		background: linear-gradient(to bottom, #a8a090, #c5bdb0);
		border-radius: 4px;
		border-top: 1px solid rgba(0, 0, 0, 0.15);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.25);
	}

	:global(.slider-range) {
		height: 100%;
		background: linear-gradient(to bottom, #8bb0d4, #5a8ab8);
		border-radius: 4px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	:global(.slider-thumb) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(to bottom, #faf7f2, #ddd8ce);
		border: 1px solid #908676;
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.3),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		cursor: grab;
		outline: none;
	}

	:global(.slider-thumb[data-dragging]) {
		cursor: grabbing;
		background: linear-gradient(to bottom, #ddd8ce, #faf7f2);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	:global(.slider-thumb:focus-visible) {
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.3),
			0 0 0 2px rgba(90, 138, 184, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.grid-container {
		position: relative;
	}

	.image-frame {
		position: absolute;
		border-radius: 3px;
		background: #fff;
		padding: 3px;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.22),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
	}

	.image-frame:hover {
		box-shadow:
			0 4px 14px rgba(0, 0, 0, 0.3),
			0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		z-index: 1;
	}

	.image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 2px;
	}
</style>
