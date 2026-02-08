import { ChessStudyMove, Variation } from '../storage';

export function is_first_move_in_variation(
	variation: Variation,
	san: string,
): boolean {
	if (variation.moves.length > 0) {
		const firstMove: ChessStudyMove = variation.moves[0];
		if (firstMove.san === san) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}
