<script lang="ts">
	import { Switch } from "@ark-ui/svelte/switch";

	import { css } from "styled-system/css";
	import { switchControl } from "styled-system/recipes";

	import HelpTip from "./HelpTip.svelte";

	let {
		label,
		checked = $bindable(),
		help,
		onCheckedChange,
	}: {
		label: string;
		checked: boolean;
		help?: string;
		onCheckedChange?: (checked: boolean) => void;
	} = $props();

	const classes = switchControl();
	const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });
</script>

<Switch.Root
	class={classes.root}
	bind:checked
	onCheckedChange={(detail) => onCheckedChange?.(detail.checked)}
>
	<Switch.Label class={classes.label}>
		{#if help}
			<span class={labelInner}>{label}<HelpTip text={help} /></span>
		{:else}
			{label}
		{/if}
	</Switch.Label>
	<Switch.Control class={classes.control}>
		<Switch.Thumb class={classes.thumb} />
	</Switch.Control>
	<Switch.HiddenInput />
</Switch.Root>
