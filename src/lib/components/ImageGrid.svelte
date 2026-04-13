<script lang="ts">
	import type { LayoutItem } from '$lib/justified-layout';
	import { justifiedLayout } from '$lib/justified-layout';
	import { useContainerWidth } from '$lib/composables/use-container-width.svelte';
	import ImageFrame from './ImageFrame.svelte';

	let {
		images,
		targetRowHeight,
		gap
	}: {
		images: LayoutItem[];
		targetRowHeight: number;
		gap: number;
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
			? justifiedLayout(activeImages, container.width, targetRowHeight, gap)
			: null
	);
</script>

<div
	bind:this={container.element}
	class="relative transition-height duration-350 ease-out"
	style:height="{layout?.totalHeight ?? 0}px"
>
	{#if layout}
		{#each layout.items as item (item.id)}
			<ImageFrame {item} onError={handleImageError} />
		{/each}
	{/if}
</div>
