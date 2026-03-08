import { NeoMove } from './NeoMove';

function serializePreOrderRecursive(
	node: NeoMove | null,
	moves: (Omit<NeoMove, 'left' | 'right'> | null)[],
) {
	if (node === null) {
		moves.push(null);
		return;
	}

	moves.push(node);
	serializePreOrderRecursive(node.left, moves);
	serializePreOrderRecursive(node.right, moves);
}

// function to serialize a tree.
export function serializePreOrder(
	root: NeoMove,
): (Omit<NeoMove, 'left' | 'right'> | null)[] {
	const moves: (Omit<NeoMove, 'left' | 'right'> | null)[] = [];
	serializePreOrderRecursive(root, moves);
	return moves;
}
