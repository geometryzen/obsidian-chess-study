import { JgnMove } from './JgnMove';
import { JgnStudy } from './JgnStudy';

export function first_jgn_move(study: JgnStudy): JgnMove | null {
	const moves = study.moves;
	if (moves.length > 0) {
		return moves[0];
	} else {
		return null;
	}
}
