import { Move } from 'chess.js';
import { NeoMove } from '../../lib/neo/NeoMove';
import { neo_move_from_user_move } from './neo_move_from_user_move';

/**
 * Ensures that the played move exists in the specified scope move.
 *
 * @param m the played move
 * @param neoMove the move that will own the played move.
 * @returns the current move.
 */
export function ensure_move_is_neo_move_or_variation(
	m: Move,
	neoMove: NeoMove,
): NeoMove {
	if (neoMove.san === m.san) {
		return neoMove;
	} else {
		// The played move is not the same as the Main Line move.
		// If a variation exists that starts with the playedMove, then go into that variation.
		// Otherwise, create a new variation with the played move as the first move
		let right = neoMove.right;
		while (right) {
			if (right.san === m.san) {
				return right;
			}
			right = right.right;
		}
		// The move does not exist in any existing variation so we create a new variation
		const move = neo_move_from_user_move(m, null, null);
		neoMove.right = move;
		return move;
	}
}
