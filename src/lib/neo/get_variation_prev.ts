import { find_parent } from './find_parent';
import { get_variation_next } from './get_variation_next';
import { NeoMove } from './NeoMove';

export function get_variation_prev(
	root: NeoMove | null,
	move: NeoMove,
): NeoMove | null {
	const parent = find_parent(root, move);
	if (!parent) {
		return null;
	} else {
		if (get_variation_next(parent) === move) {
			return parent;
		} else {
			return null;
		}
	}
}
