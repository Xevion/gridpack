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
						onload={(e) => e.currentTarget.classList.add('loaded')}
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
		margin-bottom: 28px;
		padding-bottom: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	.title {
		font-family: 'Playfair Display Variable', Georgia, serif;
		font-size: 48px;
		font-weight: 800;
		color: #2e2519;
		margin: 0;
		text-shadow:
			0 2px 0 rgba(255, 255, 255, 0.6),
			0 -1px 0 rgba(0, 0, 0, 0.08);
		letter-spacing: -0.5px;
	}

	.subtitle {
		font-size: 13px;
		color: #8a7e6e;
		margin: 6px 0 0;
		letter-spacing: 2px;
		text-transform: uppercase;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.controls-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: flex-end;
		padding: 12px 16px;
		margin-bottom: 24px;
		background: linear-gradient(to bottom, #ddd4c7, #e2dace);
		border-radius: 6px;
		border-top: 1px solid rgba(255, 255, 255, 0.6);
		border-left: 1px solid rgba(255, 255, 255, 0.4);
		border-right: 1px solid #b5a994;
		border-bottom: 1px solid #a89a84;
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(0, 0, 0, 0.04),
			0 1px 0 rgba(255, 255, 255, 0.6),
			0 2px 4px rgba(0, 0, 0, 0.06);
	}

	.control-group {
		min-width: 110px;
	}

	.control-group-wide {
		min-width: 160px;
		flex: 1;
	}

	:global(.control-label) {
		display: block;
		font-size: 10px;
		font-weight: 600;
		color: #5a5042;
		margin-bottom: 4px;
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
		font-size: 10px;
		font-weight: 600;
		color: #5a5042;
		font-variant-numeric: tabular-nums;
	}

	:global(.number-input-control) {
		display: inline-flex;
		border: 1px solid #8a7f6e;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
	}

	:global(.number-btn),
	:global(.number-field) {
		display: block;
		height: 26px;
		margin: 0;
		padding: 0;
		border: none;
		outline: none;
		box-sizing: border-box;
	}

	:global(.number-btn) {
		width: 28px;
		font-size: 14px;
		font-weight: 700;
		line-height: 26px;
		color: #fff;
		cursor: pointer;
		background: linear-gradient(to bottom, #918577, #6e6356);
		text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
		transition: background 0.15s ease;
	}

	:global(.number-btn:hover) {
		background: linear-gradient(to bottom, #a19586, #837869);
	}

	:global(.number-btn:active) {
		background: linear-gradient(to bottom, #6e6356, #918577);
		transition: none;
	}

	:global(.number-field) {
		width: 44px;
		font-size: 13px;
		font-family: 'Source Sans Pro', sans-serif;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: #3a3226;
		background: linear-gradient(to bottom, #ebe5db, #f8f4ee);
		box-shadow:
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset -1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(.number-field:focus) {
		background: linear-gradient(to bottom, #e5dfd5, #f5f0e8);
		box-shadow:
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset -1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(90, 120, 160, 0.3);
	}

	:global(.slider-control) {
		position: relative;
		display: flex;
		align-items: center;
		height: 18px;
	}

	:global(.slider-track) {
		flex: 1;
		height: 6px;
		background: linear-gradient(to bottom, #a8a090, #c5bdb0);
		border-radius: 3px;
		border-top: 1px solid rgba(0, 0, 0, 0.12);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.22);
	}

	:global(.slider-range) {
		height: 100%;
		background: linear-gradient(to bottom, #8bb0d4, #5a8ab8);
		border-radius: 3px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	:global(.slider-thumb) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: linear-gradient(to bottom, #faf7f2, #ddd8ce);
		border: 1px solid #908676;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.28),
			0 0 1px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		cursor: grab;
		outline: none;
		transition:
			background 0.15s ease,
			box-shadow 0.2s ease,
			transform 0.1s ease;
	}

	:global(.slider-thumb:hover) {
		transform: scale(1.1);
		box-shadow:
			0 1px 5px rgba(0, 0, 0, 0.32),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	:global(.slider-thumb[data-dragging]) {
		cursor: grabbing;
		background: linear-gradient(to bottom, #e8e3d9, #faf7f2);
		transform: scale(1.08);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		transition:
			background 0.1s ease,
			box-shadow 0.1s ease,
			transform 0.08s ease;
	}

	:global(.slider-thumb:focus-visible) {
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.28),
			0 0 0 2px rgba(90, 138, 184, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.grid-container {
		position: relative;
		transition: height 0.35s ease-out;
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
		transition:
			left 0.35s ease-out,
			top 0.35s ease-out,
			width 0.35s ease-out,
			height 0.35s ease-out,
			box-shadow 0.25s ease,
			transform 0.25s ease;
	}

	.image-frame:hover {
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.28),
			0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
		z-index: 1;
	}

	.image-frame::before {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 2px;
		background: linear-gradient(90deg, #ebe5db 25%, #f5f0e8 50%, #ebe5db 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.image {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 2px;
		opacity: 0;
		transition:
			filter 0.3s ease,
			opacity 0.4s ease;
	}

	.image:global(.loaded) {
		opacity: 1;
	}

	.image-frame:hover .image {
		filter: brightness(1.05) saturate(1.1);
	}
</style>
