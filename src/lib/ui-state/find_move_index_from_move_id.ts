import { JgnMove } from '../store/JgnMove';
import { MoveIndex } from './MoveIndex';

/**
 *
 * @param moves The moves, assumed to be the moves in the study (i.e. the Main Line)
 * @param moveId The move identifier.
 * @returns An index which can be used to retrieve the move.
 */
export function find_move_index_from_move_id(
	moves: JgnMove[],
	moveId: string,
): MoveIndex {
	for (const [iMainLine, move] of moves.entries()) {
		if (move.moveId === moveId) {
			// The case when the move is in the main line returns only a single number.
			return { indexLocation: null, moveIndex: iMainLine };
		} else {
			// Look in each of the variations for the moveId
			for (const [iVariant, variant] of move.variants.entries()) {
				// TODO: We should be able to go recursive.
				// We are only looking at the main move in each variation.
				const moveIndex = variant.moves.findIndex((move) => move.moveId === moveId);

				if (moveIndex >= 0) {
					return {
						indexLocation: {
							mainLineMoveIndex: iMainLine,
							variationIndex: iVariant,
						},
						moveIndex: moveIndex,
					};
				}
			}
		}
	}

	return { indexLocation: null, moveIndex: -1 };
}
