import { NeoMove } from './NeoMove';

export function get_next_move(move: NeoMove): NeoMove | null {
	return move.left;
}
