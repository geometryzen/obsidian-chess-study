import { bfsGeneratorLR } from './bfsGeneratorLR';
import { NeoMove } from './NeoMove';

export function find_parent(
	root: NeoMove | null,
	target: NeoMove,
): NeoMove | null {
	if (!root || root == target) {
		return null;
	}
	const nodes = bfsGeneratorLR(root);
	for (const node of nodes) {
		if (
			node.left?.moveId === target.moveId ||
			node.right?.moveId === target.moveId
		) {
			return node;
		}
	}
	return null;
}
