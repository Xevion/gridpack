<script lang="ts">
import { css } from "styled-system/css";
import type { LayoutItem, LayoutEngine, ImageFit } from "$lib/engines/types";
import { useContainerWidth } from "$lib/composables/use-container-width.svelte";
import ImageFrame from "./ImageFrame.svelte";

let {
	images,
	engine,
	params,
	gap,
	fit = "cover",
	containerHeight,
}: {
	images: LayoutItem[];
	engine: LayoutEngine;
	params: Record<string, unknown>;
	gap: number;
	fit?: ImageFit;
	containerHeight?: number;
} = $props();

const container = useContainerWidth();
let failedIds = $state<Set<number>>(new Set());

$effect(() => {
	images;
	failedIds = new Set();
});

function handleImageError(id: number) {
	setTimeout(() => {
		failedIds = new Set([...failedIds, id]);
	}, 500);
}

let activeImages = $derived(images.filter((img) => !failedIds.has(img.id)));

let layout = $derived(
	container.width > 0
		? engine.layout(
				activeImages,
				{
					width: container.width,
					...(engine.containerMode === "fill" && containerHeight != null
						? { height: containerHeight }
						: {}),
				},
				params,
				gap,
			)
		: null,
);

let isFillMode = $derived(engine.containerMode === "fill");
let displayHeight = $derived(
	isFillMode ? (containerHeight ?? 0) : (layout?.totalHeight ?? 0),
);
</script>

<div
	bind:this={container.element}
	class={css({
		position: 'relative',
		transition: 'height 0.35s ease-out',
		overflow: isFillMode ? 'hidden' : 'visible'
	})}
	style:height="{displayHeight}px"
>
	{#if layout}
		{#each layout.items as item (item.id)}
			<ImageFrame {item} {fit} onError={handleImageError} />
		{/each}
	{/if}
</div>
