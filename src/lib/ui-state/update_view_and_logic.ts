import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { legal_moves } from '../chess-logic/legal_moves';
import { turn_color_white_or_black } from '../chess-logic/turn_color_white_or_black';

/**
 *
 * @param chessView
 * @param setChessLogic
 * @param fen
 */
export const update_view_and_logic = (
	chessView: ChessgroundApi,
	setChessLogic: React.Dispatch<React.SetStateAction<Chess>>,
	fen: string,
): void => {
	const chess = new Chess(fen);

	chessView.set({
		fen,
		check: chess.isCheck(),
		movable: {
			free: false,
			color: turn_color_white_or_black(chess),
			dests: legal_moves(chess),
		},
		turnColor: turn_color_white_or_black(chess),
	});

	setChessLogic(chess);
};
