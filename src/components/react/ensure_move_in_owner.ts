import { Move } from 'chess.js';
import { JgnMove } from '../../lib/store/JgnMove';
import { find_variation_index_with_first_move } from '../../lib/ui-state/find_variation_index_with_first_move';
import { chess_study_move_from_user_move } from './chess_study_move_from_user_move';

/**
 * Ensures that the played move exists in the specified scope move.
 *
 * @param m the played move
 * @param ownerMove the move that will own the played move.
 * @returns the current move.
 */
export function ensure_move_in_scope(m: Move, ownerMove: JgnMove): JgnMove {
	if (ownerMove.san === m.san) {
		return ownerMove;
	} else {
		// The played move is not the same as the Main Line move.
		// If a variation exists that starts with the playedMove, then go into that variation.
		// Otherwise, create a new variation with the played move as the first move
		const variationIndex = find_variation_index_with_first_move(
			ownerMove.variants,
			m.san,
		);
		if (variationIndex !== -1) {
			return ownerMove.variants[variationIndex].moves[0];
		} else {
			// The move does not exist in any existing variation so we create a new variation
			const move = chess_study_move_from_user_move(m);
			ownerMove.variants.push({
				parentMoveId: ownerMove.moveId,
				moves: [move],
			});
			return move;
		}
	}
}
