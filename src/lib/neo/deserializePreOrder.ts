import { node_from_move_and_links } from '../transform/node_from_move_and_links';
import { NeoMove } from './NeoMove';

function deserializePreOrderRecursive(
	i: number[],
	arr: (Omit<NeoMove, 'left' | 'right'> | null)[],
): NeoMove | null {
	if (arr[i[0]] === null) {
		i[0]++;
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const node = node_from_move_and_links(arr[i[0]]!, null, null);
	i[0]++;

	node.left = deserializePreOrderRecursive(i, arr);
	node.right = deserializePreOrderRecursive(i, arr);

	return node;
}

export function deserializePreOrder(
	arr: (Omit<NeoMove, 'left' | 'right'> | null)[],
) {
	const i: number[] = [0];
	return deserializePreOrderRecursive(i, arr);
}
