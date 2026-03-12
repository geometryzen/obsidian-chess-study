import { find_parent } from './find_parent';
import { get_variation_next } from './get_variation_next';
import { NeoMove } from './NeoMove';

export function get_variation_depth(
	root: NeoMove | null,
	target: NeoMove,
): number {
	if (root) {
		const parent = find_parent(root, target);
		if (parent) {
			if (get_variation_next(parent) === target) {
				return get_variation_depth(root, parent) + 1;
			} else {
				return get_variation_depth(root, parent);
			}
		} else {
			// The node must be the root.
			return 0;
		}
	} else {
		// This
		return -1;
	}
}
