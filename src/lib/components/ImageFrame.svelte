<script lang="ts">
	import { untrack } from "svelte";
	import { cubicIn, cubicOut } from "svelte/easing";
	import { Spring } from "svelte/motion";
	import { scale } from "svelte/transition";

	import type { PositionedItem, ImageFit } from "$lib/engines/types";
	import { imageUrl } from "$lib/images";

	const fitMap: Record<ImageFit, string> = {
		cover: "cover",
		stretch: "fill",
		contain: "contain",
	};

	let {
		item,
		fit = "cover",
		aspectRatio,
	}: {
		item: PositionedItem;
		fit?: ImageFit;
		aspectRatio: number;
	} = $props();

	// Drive position through a spring so that rapid retargeting carries the existing
	// velocity forward instead of restarting an easing curve from rest — a CSS
	// transition would snap the velocity on every new target, producing a jerk.
	// untrack: seed from the initial box only; the $effect owns every retarget after.
	const box = new Spring(
		untrack(() => ({ x: item.x, y: item.y })),
		{ stiffness: 0.05, damping: 0.55 },
	);

	$effect(() => {
		box.target = { x: item.x, y: item.y };
	});

	// Transient picsum failures (rate limits, hiccups) are retried in place with a
	// cache-busting suffix rather than removing the image from the layout — removal
	// would reflow every other tile and is the wrong response to a recoverable error.
	const MAX_RETRIES = 4;
	let retries = $state(0);
	let src = $derived(imageUrl(item.id, aspectRatio) + (retries > 0 ? `?r=${retries}` : ""));

	function handleError() {
		if (retries >= MAX_RETRIES) return;
		const next = retries + 1;
		setTimeout(() => {
			retries = next;
		}, 400 * next);
	}
</script>

<!-- scale animates `transform`, independent of the spring-driven `translate`, so
     tiles place down on enter and shrink away on exit without disturbing position. -->
<div
	class="image-frame"
	style="translate:{box.current.x}px {box.current.y}px;width:{item.width}px;height:{item.height}px"
	in:scale={{ start: 0.85, duration: 220, easing: cubicOut }}
	out:scale={{ start: 0.85, duration: 180, easing: cubicIn }}
>
	<img
		{src}
		alt="Photo {item.id}"
		loading="lazy"
		class="image"
		style:object-fit={fitMap[fit]}
		onload={(e) => e.currentTarget.parentElement?.classList.add("loaded")}
		onerror={handleError}
	/>
</div>

<style>
	.image-frame {
		--mat-width: 6px;
		position: absolute;
		left: 0;
		top: 0;
		padding: var(--mat-width);
		border-radius: 4px;
		background: linear-gradient(135deg, var(--colors-surface-light), var(--colors-surface));
		will-change: translate;
		box-shadow:
			0 3px 10px rgba(0, 0, 0, 0.22),
			0 1px 3px rgba(0, 0, 0, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			inset 1px 0 0 rgba(255, 255, 255, 0.3);
		transition:
			width 0.35s ease-out,
			height 0.35s ease-out,
			box-shadow 0.25s ease;
	}

	.image-frame:hover {
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.28),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			inset 1px 0 0 rgba(255, 255, 255, 0.3);
		z-index: 1;
	}

	.image-frame::after {
		content: "";
		position: absolute;
		inset: calc(var(--mat-width) - 1px);
		border-radius: 2px;
		border: 1px solid transparent;
		border-top-color: rgba(255, 255, 255, 0.45);
		border-left-color: rgba(255, 255, 255, 0.35);
		border-bottom-color: rgba(0, 0, 0, 0.08);
		border-right-color: rgba(0, 0, 0, 0.06);
		pointer-events: none;
		z-index: 2;
	}

	.image-frame::before {
		content: "";
		position: absolute;
		inset: var(--mat-width);
		border-radius: 2px;
		background: linear-gradient(
			90deg,
			var(--colors-parchment-mid) 25%,
			var(--colors-parchment-light) 50%,
			var(--colors-parchment-mid) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.image-frame:global(.loaded)::before {
		animation: none;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.image-frame .image {
		position: relative;
		z-index: 1;
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 2px;
		opacity: 1;
		transition:
			filter 0.3s ease,
			opacity 0.4s ease;

		@starting-style {
			opacity: 0;
		}
	}

	.image-frame:hover .image {
		filter: brightness(1.05) saturate(1.08);
	}
</style>
