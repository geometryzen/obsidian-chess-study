import { NeoMove } from './NeoMove';

/**
 * We must be careful here.
 * In general there are zero to many next moves owing to the fact that there are variations.
 * What we are returning here is the main line.
 */
export function get_next_move(move: NeoMove): NeoMove | null {
	return move.left;
}
