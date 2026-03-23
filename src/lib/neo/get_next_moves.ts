import { NeoMove } from './NeoMove';

export function get_next_moves(move: NeoMove): NeoMove[] {
	const moves: NeoMove[] = [];
	const next_move = move.left;
	if (next_move) {
		moves.push(next_move);
		let variation = next_move.right;
		while (variation) {
			moves.push(variation);
			variation = variation.right;
		}
	}
	return moves;
}
