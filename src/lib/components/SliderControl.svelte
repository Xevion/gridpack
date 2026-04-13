<script lang="ts">
	import { css } from 'styled-system/css';
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

<div class={css({ minWidth: '160px', flex: wide ? '1' : undefined })}>
	<Slider.Root bind:value {min} {max} {step}>
		<div class={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })}>
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
	.control-label {
		display: block;
		font-size: 10px;
		font-weight: 600;
		color: var(--colors-ink-soft);
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	.slider-value {
		font-size: 10px;
		font-weight: 600;
		color: var(--colors-ink-soft);
		font-variant-numeric: tabular-nums;
	}

	.slider-control {
		position: relative;
		display: flex;
		align-items: center;
		height: 18px;
	}

	.slider-track {
		flex: 1;
		height: 6px;
		background: linear-gradient(to bottom, #a8a090, var(--colors-control-lighter));
		border-radius: 3px;
		border-top: 1px solid rgba(0, 0, 0, 0.12);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.22);
	}

	.slider-range {
		height: 100%;
		background: linear-gradient(to bottom, var(--colors-accent-light), var(--colors-accent));
		border-radius: 3px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.slider-thumb {
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

	.slider-thumb:hover {
		transform: scale(1.1);
		box-shadow:
			0 1px 5px rgba(0, 0, 0, 0.32),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.slider-thumb[data-dragging] {
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

	.slider-thumb:focus-visible {
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.28),
			0 0 0 2px var(--colors-accent-focus),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}
</style>
