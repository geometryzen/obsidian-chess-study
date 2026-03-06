import { find_parent } from './find_parent';
import { get_move_next } from './get_move_next';
import { NeoMove } from './NeoMove';

export function get_move_prev(
	root: NeoMove | null,
	move: NeoMove,
): NeoMove | null {
	const parent = find_parent(root, move);
	if (!parent) {
		return null;
	} else {
		if (get_move_next(parent) === move) {
			return parent;
		} else {
			return get_move_prev(root, parent);
		}
	}
}
