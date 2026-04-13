<script lang="ts">
	import type { PositionedItem } from '$lib/justified-layout';
	import { imageUrl } from '$lib/images';

	let { item, onError }: { item: PositionedItem; onError?: (id: number) => void } = $props();
</script>

<div
	class="image-frame"
	style="translate:{item.x}px {item.y}px;width:{item.width}px;height:{item.height}px"
>
	<img
		src={imageUrl(item.id, item.width, item.height)}
		alt="Photo {item.id}"
		loading="lazy"
		class="image"
		onload={(e) => e.currentTarget.parentElement!.classList.add('loaded')}
		onerror={() => onError?.(item.id)}
	/>
</div>

<style>
	.image-frame {
		position: absolute;
		left: 0;
		top: 0;
		will-change: translate;
		border-radius: 3px;
		background: white;
		padding: 3px;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.22),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		transition:
			translate 0.35s ease-out,
			width 0.35s ease-out,
			height 0.35s ease-out,
			box-shadow 0.25s ease;
	}

	.image-frame:hover {
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.28),
			0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		z-index: 1;
	}

	.image-frame::before {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 2px;
		background: linear-gradient(
			90deg,
			var(--colors-parchment-mid) 25%,
			#f5f0e8 50%,
			var(--colors-parchment-mid) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.image-frame.loaded::before {
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
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		filter: brightness(1.05) saturate(1.1);
	}
</style>
