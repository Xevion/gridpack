/**
 * Map lookup for tests, failing loudly on a missing key instead of leaning on a
 * non-null assertion. A lookup that misses means the layout dropped an image, so
 * the throw is a more useful signal than a downstream `undefined`.
 */
export function must<K, V>(map: Map<K, V>, key: K): V {
	const value = map.get(key);
	if (value === undefined) throw new Error(`no entry for key ${String(key)}`);
	return value;
}
