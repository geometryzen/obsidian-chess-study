import { bfsGeneratorLR } from './bfsGeneratorLR';
import { is_left_child_of_parent } from './is_left_child_of_parent';
import { is_right_child_of_parent } from './is_right_child_of_parent';
import { NeoMove } from './NeoMove';

/**
 * The parent of a move means that the move is contained in either the left or right properties of the parent.
 */
export function find_parent(
	root: NeoMove | null,
	child: NeoMove,
): NeoMove | null {
	if (!root || root == child) {
		return null;
	}
	const nodes = bfsGeneratorLR(root);
	for (const node of nodes) {
		if (
			is_left_child_of_parent(child, node) ||
			is_right_child_of_parent(child, node)
		) {
			return node;
		}
	}
	return null;
}
