import { JgnMove, JgnVariation } from '../store/JgnMove';
import { find_move_index_from_move_id } from './find_move_index_from_move_id';

export function get_move_from_offset(
	moves: JgnMove[],
	moveId: string,
	offset: 1 | -1,
) {
	const { indexLocation, moveIndex } = find_move_index_from_move_id(
		moves,
		moveId,
	);
	// Are we in a variant? Are we not? Decide which move to display

	if (indexLocation) {
		// The move that is our origin is in a variation.
		const mainLineMove: JgnMove = moves[indexLocation.mainLineMoveIndex];
		const variations: JgnVariation[] = mainLineMove.variants;
		const variation: JgnVariation = variations[indexLocation.variationIndex];

		if (moveIndex === 0 && offset === -1) {
			// If we are the first move in the variation and we are going backwards,
			// then the move we want is the Main Line move prior to the Main Line move that contains the variation.
			return get_move_from_offset(moves, mainLineMove.moveId, -1);
		}

		if (typeof variation.moves[moveIndex + offset] !== 'undefined') {
			return variation.moves[moveIndex + offset];
		}

		return moves[indexLocation.mainLineMoveIndex + offset];
	} else {
		// The move that is our origin is in the Main Line.
		if (typeof moves[moveIndex + offset] !== 'undefined') {
			return moves[moveIndex + offset];
		} else {
			return null;
		}
	}
}
