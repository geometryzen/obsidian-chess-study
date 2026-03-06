import { NeoMove } from './NeoMove';

/**
 * This is the most logical iteration sequence for handling variations consistently.
 */
export function* dfsGeneratorRL(
	node: NeoMove | null,
): Generator<NeoMove, void, undefined> {
	if (!node) {
		return;
	}

	yield node;

	if (node.right) {
		yield* dfsGeneratorRL(node.right);
	}

	if (node.left) {
		yield* dfsGeneratorRL(node.left);
	}
}
