<script lang="ts">
import { switchControl } from "styled-system/recipes";
import { Switch } from "@ark-ui/svelte/switch";

let {
	label,
	checked = $bindable(),
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	onCheckedChange?: (checked: boolean) => void;
} = $props();

const classes = switchControl();
</script>

<Switch.Root class={classes.root} bind:checked onCheckedChange={(detail) => onCheckedChange?.(detail.checked)}>
	<Switch.Control class={classes.control}>
		<Switch.Thumb class={classes.thumb} />
	</Switch.Control>
	<Switch.Label class={classes.label}>{label}</Switch.Label>
	<Switch.HiddenInput />
</Switch.Root>
