import { NeoMove } from './NeoMove';

export function* dfsGeneratorLR(
	node: NeoMove | null,
): Generator<NeoMove, void, undefined> {
	if (!node) {
		return;
	}

	yield node;

	// Recursively yield all values from the left subtree
	if (node.left) {
		yield* dfsGeneratorLR(node.left);
	}

	// Recursively yield all values from the right subtree
	if (node.right) {
		yield* dfsGeneratorLR(node.right);
	}
}
