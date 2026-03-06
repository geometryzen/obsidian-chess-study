import { JgnMove } from './JgnMove';
import { JgnStudy } from './JgnStudy';

export function last_jgn_move(study: JgnStudy): JgnMove | null {
	const moves = study.moves;
	if (moves.length > 0) {
		return moves[moves.length - 1];
	} else {
		return null;
	}
}
