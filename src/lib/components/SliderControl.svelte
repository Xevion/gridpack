<script lang="ts">
import { slider } from "styled-system/recipes";
import { Slider } from "@ark-ui/svelte/slider";

let {
	label,
	value = $bindable(),
	min,
	max,
	step,
	wide = false,
	onValueChange,
}: {
	label: string;
	value: number[];
	min: number;
	max: number;
	step: number;
	wide?: boolean;
	onValueChange?: (detail: { value: number[] }) => void;
} = $props();

let classes = $derived(slider({ wide }));
</script>

<div class={classes.root}>
	<Slider.Root bind:value {min} {max} {step} {onValueChange}>
		<div class={classes.header}>
			<Slider.Label class={classes.label}>{label}</Slider.Label>
			<Slider.ValueText class={classes.valueText} />
		</div>
		<Slider.Control class={classes.control}>
			<Slider.Track class={classes.track}>
				<Slider.Range class={classes.range} />
			</Slider.Track>
			<Slider.Thumb index={0} class={classes.thumb}>
				<Slider.HiddenInput />
			</Slider.Thumb>
		</Slider.Control>
	</Slider.Root>
</div>
