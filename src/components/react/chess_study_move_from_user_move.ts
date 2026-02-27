import { Move } from 'chess.js';
import { nanoid } from 'nanoid';
import { JgnMove } from '../../lib/jgn/JgnMove';

export function chess_study_move_from_user_move(m: Move): JgnMove {
	const move: JgnMove = {
		moveId: nanoid(),
		variants: [],
		shapes: [],
		comment: null,
		color: m.color,
		san: m.san,
		after: m.after,
		from: m.from,
		to: m.to,
		promotion: m.promotion,
		nags: [],
	};
	return move;
}
