import { NeoMove } from './NeoMove';

export function get_variation_next(move: NeoMove): NeoMove | null {
	return move.right;
}
