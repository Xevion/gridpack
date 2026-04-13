<script lang="ts">
import { segmentGroup } from "styled-system/recipes";
import { SegmentGroup } from "@ark-ui/svelte/segment-group";

let {
	value = $bindable(),
	items,
}: {
	value: string;
	items: { value: string; label: string }[];
} = $props();

const classes = segmentGroup();
</script>

<SegmentGroup.Root class={classes.root} bind:value>
	<SegmentGroup.Indicator class={classes.indicator} />
	{#each items as item}
		<SegmentGroup.Item class={classes.item} value={item.value}>
			<SegmentGroup.ItemText class={classes.itemText}>{item.label}</SegmentGroup.ItemText>
			<SegmentGroup.ItemControl class={classes.itemControl} />
			<SegmentGroup.ItemHiddenInput />
		</SegmentGroup.Item>
	{/each}
</SegmentGroup.Root>
