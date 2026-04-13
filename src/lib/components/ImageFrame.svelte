<script lang="ts">
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
	onError,
}: {
	item: PositionedItem;
	fit?: ImageFit;
	onError?: (id: number) => void;
} = $props();
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
		style:object-fit={fitMap[fit]}
		onload={(e) => e.currentTarget.parentElement!.classList.add('loaded')}
		onerror={() => onError?.(item.id)}
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
			translate 0.35s ease-out,
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
		content: '';
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
		content: '';
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
