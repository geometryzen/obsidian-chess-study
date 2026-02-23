import { Move } from 'chess.js';
import { nanoid } from 'nanoid';
import { ChessStudyMove } from '../../lib/store';

export function chess_study_move_from_user_move(m: Move): ChessStudyMove {
	const move: ChessStudyMove = {
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
