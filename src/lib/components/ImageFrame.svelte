<script lang="ts">
	import type { PositionedItem } from '$lib/justified-layout';
	import { imageUrl } from '$lib/images';

	let { item, onError }: { item: PositionedItem; onError?: (id: number) => void } = $props();
</script>

<div
	class="image-frame rounded-[3px] bg-white p-[3px]"
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
