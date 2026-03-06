import { JgnMove } from '../../lib/jgn/JgnMove';
import { JgnStudy } from '../../lib/jgn/JgnStudy';

export function first_jgn_move(jgnStudy: JgnStudy): JgnMove {
	const moves = jgnStudy.moves;
	return moves[0];
}
