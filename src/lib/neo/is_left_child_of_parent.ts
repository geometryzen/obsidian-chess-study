import { NeoMove } from './NeoMove';

export function is_left_child_of_parent(
	child: NeoMove | null,
	parent: NeoMove,
): boolean {
	if (child) {
		return parent.left?.moveId === child.moveId;
	} else {
		return false;
	}
}
