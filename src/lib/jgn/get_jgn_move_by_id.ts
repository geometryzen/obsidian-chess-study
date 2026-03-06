import { find_move_index_from_move_id } from './find_move_index_from_move_id';
import { JgnMove } from './JgnMove';
import { JgnStudy } from './JgnStudy';

export function get_jgn_move_by_id(study: JgnStudy, moveId: string): JgnMove {
	const moves = study.moves;
	const { indexLocation: variant, moveIndex } = find_move_index_from_move_id(
		moves,
		moveId,
	);
	// Are we in a variant? Are we not? Decide which move to display

	if (variant) {
		const variantMoves =
			moves[variant.mainLineMoveIndex].variants[variant.variationIndex].moves;

		if (typeof variantMoves[moveIndex] !== 'undefined') {
			return variantMoves[moveIndex];
		}

		return moves[variant.mainLineMoveIndex];
	}
	return moves[moveIndex];
}
