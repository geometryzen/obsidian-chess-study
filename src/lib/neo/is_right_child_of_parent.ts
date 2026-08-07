import { NeoMove } from './NeoMove';

export function is_right_child_of_parent(
	child: NeoMove | null,
	parent: NeoMove,
): boolean {
	if (child) {
		return parent.right?.moveId === child.moveId;
	} else {
		return false;
	}
}
