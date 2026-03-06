import { GameState } from './ChessStudy';
import { find_move_index_from_move_id } from '../../lib/jgn/find_move_index_from_move_id';
import { JgnMove } from '../../lib/jgn/JgnMove';

export function get_current_jgn_move(state: GameState): JgnMove | null {
	const currentMoveId = state.currentMove?.moveId;
	const moves = state.jgnStudy.moves;

	if (currentMoveId) {
		const { indexLocation: variant, moveIndex } = find_move_index_from_move_id(
			moves,
			currentMoveId,
		);

		if (variant) {
			return moves[variant.mainLineMoveIndex].variants[variant.variationIndex]
				.moves[moveIndex];
		} else {
			return moves[moveIndex];
		}
	}

	return null;
}
