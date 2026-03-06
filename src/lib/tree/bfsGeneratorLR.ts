/*
class TreeNode<T> {
  constructor(
	public value: T,
	public left: TreeNode<T> | null = null,
    
	public right: TreeNode<T> | null = null
  ) {}
}
*/

import { NeoMove } from './NeoMove';

/**
 * Performs a breadth-first traversal of a binary tree using a generator.
 * @param root The root node of the tree.
 * @returns A generator that yields values in BFS order.
 */
export function* bfsGeneratorLR(
	root: NeoMove | null,
): Generator<NeoMove, void, undefined> {
	if (!root) {
		return;
	}

	// Use a queue to keep track of nodes to be visited (FIFO: First-In, First-Out)
	const queue: NeoMove[] = [root];

	while (queue.length > 0) {
		// Dequeue the first node in the queue
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const current = queue.shift()!;

		// Yield the current node (or current node's value)
		yield current;

		// Enqueue the left child if it exists
		if (current.left) {
			queue.push(current.left);
		}

		// Enqueue the right child if it exists
		if (current.right) {
			queue.push(current.right);
		}
	}
}

// --- Example Usage ---

const bfsIterator = bfsGeneratorLR(/*root*/ null);
for (const value of bfsIterator) {
	console.log(value);
}

const iterator: Generator<NeoMove, void, undefined> = bfsGeneratorLR(
	/*root*/ null,
);
let nextNode = iterator.next();
while (!nextNode.done) {
	// Process nextNode.value
	nextNode = iterator.next();
}

// 1. Create a sample binary tree
/*
const treeRoot = new TreeNode(10,
  new TreeNode(6, new TreeNode(3), new TreeNode(8)),
  new TreeNode(15, null, new TreeNode(20))
);
*/
// 2. Use the generator to iterate through the tree in BFS order
/*
console.log("Breadth-First Search Traversal:");
const bfsIterator = bfsGenerator(treeRoot);

for (const value of bfsIterator) {
  console.log(value);
}
*/
// Expected output order:
// 10
// 6
// 15
// 3
// 8
// 20
