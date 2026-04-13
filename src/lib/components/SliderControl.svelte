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
