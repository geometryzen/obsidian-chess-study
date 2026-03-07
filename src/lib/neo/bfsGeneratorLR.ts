/*
class TreeNode<T> {
  constructor(
	public value: T,
	public left: TreeNode<T> | null = null,
    
	public right: TreeNode<T> | null = null
  ) {}
}
*/

import { Queue } from '../lang/Queue';
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

	const queue = new Queue<NeoMove>();
	queue.enqueue(root);
	//const queue: NeoMove[] = [root];

	while (!queue.isEmpty()) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const current = queue.dequeue()!;

		yield current;

		if (current.left) {
			queue.enqueue(current.left);
		}

		if (current.right) {
			queue.enqueue(current.right);
		}
	}
}
