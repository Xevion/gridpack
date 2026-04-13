export function useElementSize() {
	let width = $state(0);
	let height = $state(0);
	let element: HTMLElement | undefined = $state();

	$effect(() => {
		if (!element) return;
		const ro = new ResizeObserver((entries) => {
			const rect = entries[0].contentRect;
			width = rect.width;
			height = rect.height;
		});
		ro.observe(element);
		return () => ro.disconnect();
	});

	return {
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get element() {
			return element;
		},
		set element(el: HTMLElement | undefined) {
			element = el;
		},
	};
}
