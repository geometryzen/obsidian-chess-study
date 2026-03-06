import { NeoMove } from './NeoMove';

export function* dfsGeneratorLR(
	node: NeoMove | null,
): Generator<NeoMove, void, undefined> {
	if (!node) {
		return; // Base case: end the generator
	}

	// Yield the current node (or current node's value (Pre-order: Root, Left, Right)
	yield node /*.value*/;

	// Recursively yield all values from the left subtree
	if (node.left) {
		yield* dfsGeneratorLR(node.left);
	}

	// Recursively yield all values from the right subtree
	if (node.right) {
		yield* dfsGeneratorLR(node.right);
	}
}

const dfsIterator = dfsGeneratorLR(/*root*/ null);
for (const value of dfsIterator) {
	console.log(value);
}

const iterator: Generator<NeoMove, void, undefined> = dfsGeneratorLR(
	/*root*/ null,
);
let nextNode = iterator.next();
while (!nextNode.done) {
	// Process nextNode.value
	nextNode = iterator.next();
}
