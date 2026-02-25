import {
	ChessStudyFileMove,
	ChessStudyFileVariation,
} from '../store/ChessStudyFileMove';

export function is_first_move_in_variation(
	variation: ChessStudyFileVariation,
	san: string,
): boolean {
	if (variation.moves.length > 0) {
		const firstMove: ChessStudyFileMove = variation.moves[0];
		if (firstMove.san === san) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}
