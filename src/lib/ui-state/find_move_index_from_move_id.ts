import { ChessStudyMove } from '../store';
import { MoveIndex } from './MoveIndex';

/**
 *
 * @param moves The moves, assumed to be the moves in the study
 * @param moveId The move identifier.
 * @returns An index which can be used to retrieve the move.
 */
export function find_move_index_from_move_id(
	moves: ChessStudyMove[],
	moveId: string,
): MoveIndex {
	for (const [iMainLine, move] of moves.entries()) {
		if (move.moveId === moveId) {
			return { indexLocation: null, moveIndex: iMainLine };
		} else {
			// Look in each of the variations for the moveId
			for (const [iVariant, variant] of move.variants.entries()) {
				// TODO: We should be able to go recursive.
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
