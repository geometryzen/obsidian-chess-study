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

	while (!queue.isEmpty()) {
		const current = queue.pop();

		yield current;

		if (current.left) {
			queue.push(current.left);
		}

		if (current.right) {
			queue.push(current.right);
		}
	}
}
