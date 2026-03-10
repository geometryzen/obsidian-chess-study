import { NeoMove } from './NeoMove';

export function rightmost_neo_node(node: NeoMove) {
	if (node) {
		if (node.right) {
			return rightmost_neo_node(node.right);
		} else {
			return node;
		}
	} else {
		throw new Error();
	}
}
