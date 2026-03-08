import { Queue } from '../lang/Queue';
import { NeoMove } from './NeoMove';

export function serializeLevelOrder(
	root: NeoMove | null,
): (Omit<NeoMove, 'left' | 'right'> | null)[] {
	const arr: (Omit<NeoMove, 'left' | 'right'> | null)[] = [];
	const q = new Queue<NeoMove | null>();

	q.enqueue(root);

	while (!q.isEmpty()) {
		const curr = q.dequeue();

		// If curr node is null,
		// append -1 to result.
		if (curr === null) {
			arr.push(null);
			continue;
		}

		// else push its value into result
		arr.push(curr);

		// enqueue children
		q.enqueue(curr.left);
		q.enqueue(curr.right);
	}

	return arr;
}
