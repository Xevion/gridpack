<script lang="ts">
	import { useContainerWidth } from "$lib/composables/use-container-width.svelte";
	import { useThrottled } from "$lib/composables/use-throttled.svelte";
	import type { LayoutItem, LayoutEngine, ImageFit } from "$lib/engines/types";

	import { css } from "styled-system/css";

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

	let aspectById = $derived(new Map(images.map((img) => [img.id, img.aspectRatio])));

	// Throttle the entire layout-input set so rapid retargeting (holding the count
	// stepper, dragging a slider, live resize) recomputes ~7x/sec instead of every
	// frame. Tiles get time to travel toward each target before being re-aimed,
	// which stops the springs from fighting their own momentum. Engine and params
	// are throttled together so they always swap as a matched pair.
	const inputs = useThrottled(
		() => ({
			images,
			engine,
			params,
			gap,
			width: container.width,
			height: containerHeight,
		}),
		140,
	);

	let layout = $derived.by(() => {
		const { images, engine, params, gap, width, height } = inputs.current;
		if (width <= 0) return null;
		return engine.layout(
			images,
			{
				width,
				...(engine.containerMode === "fill" && height != null ? { height } : {}),
			},
			params,
			gap,
		);
	});

	let isFillMode = $derived(inputs.current.engine.containerMode === "fill");
	let displayHeight = $derived(
		isFillMode ? (inputs.current.height ?? 0) : (layout?.totalHeight ?? 0),
	);
</script>

<div
	bind:this={container.element}
	class={css({
		position: "relative",
		transition: "height 0.35s ease-out",
		overflow: isFillMode ? "hidden" : "visible",
	})}
	style:height="{displayHeight}px"
>
	{#if layout}
		{#each layout.items as item (item.id)}
			<ImageFrame {item} {fit} aspectRatio={aspectById.get(item.id) ?? 1} />
		{/each}
	{/if}
</div>
