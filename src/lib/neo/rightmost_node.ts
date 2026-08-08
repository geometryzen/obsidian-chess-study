import { NeoMove } from './NeoMove';

export function rightmost_node(node: NeoMove) {
	if (node) {
		if (node.right) {
			return rightmost_node(node.right);
		} else {
			return node;
		}
	} else {
		throw new Error();
	}
}
