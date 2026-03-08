import { Queue } from '../lang/Queue';
import { node_from_move_and_links } from '../transform/node_from_move_and_links';
import { NeoMove } from './NeoMove';

export function deserializeLevelOrder(
	arr: (Omit<NeoMove, 'left' | 'right'> | null)[],
) {
	const dataR = arr[0];
	if (dataR === null) return null;

	const root = node_from_move_and_links(dataR, null, null);
	const queue = new Queue<NeoMove>();
	queue.push(root);

	let i = 1;
	while (!queue.isEmpty()) {
		const curr = queue.pop();

		// Left child
		const dataL = arr[i];
		if (dataL !== null) {
			const left = node_from_move_and_links(dataL, null, null);
			curr.left = left;
			queue.push(left);
		}
		i++;

		// Right child
		const dataR = arr[i];
		if (dataR !== null) {
			const right = node_from_move_and_links(dataR, null, null);
			curr.right = right;
			queue.push(right);
		}
		i++;
	}

	return root;
}
