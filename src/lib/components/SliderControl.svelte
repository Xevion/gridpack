<script lang="ts">
	import { Slider } from '@ark-ui/svelte/slider';

	let {
		label,
		value = $bindable(),
		min,
		max,
		step,
		wide = false
	}: {
		label: string;
		value: number[];
		min: number;
		max: number;
		step: number;
		wide?: boolean;
	} = $props();
</script>

<div class="min-w-160px" class:flex-1={wide}>
	<Slider.Root bind:value {min} {max} {step}>
		<div class="flex justify-between items-baseline">
			<Slider.Label class="control-label">{label}</Slider.Label>
			<Slider.ValueText class="slider-value" />
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

<style>
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

	:global(.slider-value) {
		font-size: 10px;
		font-weight: 600;
		color: #5a5042;
		font-variant-numeric: tabular-nums;
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
</style>
