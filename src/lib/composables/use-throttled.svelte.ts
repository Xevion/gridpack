import { untrack } from "svelte";

/**
 * Reactive throttle with leading AND trailing edges. `current` updates
 * immediately on the first change (feels instant), then at most once per
 * `intervalMs` while the source keeps changing, and once more after it settles
 * (so the final value is always exact).
 *
 * This is deliberately a throttle, not a debounce: a debounce would freeze the
 * value entirely while the source keeps changing (holding a stepper, dragging a
 * slider), which reads as "dead". A throttle keeps stepping forward the whole
 * time while cutting the retarget rate enough that spring-driven consumers stop
 * fighting their own momentum.
 */
export function useThrottled<T>(source: () => T, intervalMs: number) {
	let current = $state(untrack(source));
	let last = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const next = source();
		const now = performance.now();
		const wait = intervalMs - (now - last);

		if (wait <= 0) {
			last = now;
			current = next;
		} else if (timer === undefined) {
			timer = setTimeout(() => {
				timer = undefined;
				last = performance.now();
				current = source();
			}, wait);
		}
	});

	// Dependency-free effect: its cleanup runs only on destroy, so the pending
	// trailing timer survives source changes and is cancelled only on teardown.
	$effect(() => () => clearTimeout(timer));

	return {
		get current() {
			return current;
		},
	};
}
