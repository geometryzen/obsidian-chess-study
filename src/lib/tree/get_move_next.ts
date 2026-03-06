import { NeoMove } from './NeoMove';

export function get_move_next(move: NeoMove): NeoMove | null {
	return move.left;
}
