import { find_parent } from './find_parent';
import { get_next_move } from './get_next_move';
import { NeoMove } from './NeoMove';

export function get_prev_move(
	root: NeoMove | null,
	move: NeoMove | null,
): NeoMove | null {
	if (move) {
		const parent = find_parent(root, move);
		if (!parent) {
			return null;
		} else {
			if (get_next_move(parent)?.moveId === move.moveId) {
				return parent;
			} else {
				return get_prev_move(root, parent);
			}
		}
	} else {
		return null;
	}
}
