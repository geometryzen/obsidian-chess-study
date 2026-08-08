import { NeoMove } from './NeoMove';
import { deserializePreOrder } from './deserializePreOrder';
import { serializePreOrder } from './serializePreOrder';

/**
 *
 */
export function clone_move_shallow(move: NeoMove | null): NeoMove | null {
	const clone = deserializePreOrder(serializePreOrder(move));
	if (clone) {
		clone.left = null;
		clone.right = null;
	}
	return clone;
}
