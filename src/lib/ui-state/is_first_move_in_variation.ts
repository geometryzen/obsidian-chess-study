import { JgnMove, JgnVariation } from '../store/JgnMove';

export function is_first_move_in_variation(
	variation: JgnVariation,
	san: string,
): boolean {
	if (variation.moves.length > 0) {
		const firstMove: JgnMove = variation.moves[0];
		if (firstMove.san === san) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}
