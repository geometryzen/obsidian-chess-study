import { NeoMove } from './NeoMove';
import { deserializePreOrder } from './deserializePreOrder';
import { serializePreOrder } from './serializePreOrder';

/**
 *
 */
export function neo_clone_move(move: NeoMove | null): NeoMove | null {
	return deserializePreOrder(serializePreOrder(move));
}
