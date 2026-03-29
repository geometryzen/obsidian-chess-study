import { NeoMove } from './NeoMove';

export function has_next_moves(move: NeoMove): boolean {
	const next_move = move.left;
	if (next_move) {
		return true;
	}
	return false;
}
