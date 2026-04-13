<script lang="ts">
	import type { PositionedItem } from '$lib/justified-layout';
	import { imageUrl } from '$lib/images';

	let { item }: { item: PositionedItem } = $props();
</script>

<div
	class="image-frame"
	style="left:{item.x}px;top:{item.y}px;width:{item.width}px;height:{item.height}px"
>
	<img
		src={imageUrl(item.id, item.width, item.height)}
		alt="Photo {item.id}"
		loading="lazy"
		class="image"
		onload={(e) => (e.currentTarget as HTMLImageElement).classList.add('loaded')}
	/>
</div>

<style>
	.image-frame {
		position: absolute;
		border-radius: 3px;
		background: #fff;
		padding: 3px;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.22),
			0 0 1px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		transition:
			left 0.35s ease-out,
			top 0.35s ease-out,
			width 0.35s ease-out,
			height 0.35s ease-out,
			box-shadow 0.25s ease,
			transform 0.25s ease;
	}

	.image-frame:hover {
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.28),
			0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
		z-index: 1;
	}

	.image-frame::before {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 2px;
		background: linear-gradient(90deg, #ebe5db 25%, #f5f0e8 50%, #ebe5db 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.image {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 2px;
		opacity: 0;
		transition:
			filter 0.3s ease,
			opacity 0.4s ease;
	}

	.image:global(.loaded) {
		opacity: 1;
	}

	.image-frame:hover .image {
		filter: brightness(1.05) saturate(1.1);
	}
</style>
