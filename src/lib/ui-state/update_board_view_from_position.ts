import { Chess as ChessPosition } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { legal_moves } from '../chess-logic/legal_moves';
import { turn_color_white_or_black } from '../chess-logic/turn_color_white_or_black';

export function update_board_view_from_position(
	chessView: ChessgroundApi,
	chess: ChessPosition,
): void {
	chessView.set({
		fen: chess.fen(),
		check: chess.isCheck(),
		movable: {
			free: false,
			color: turn_color_white_or_black(chess),
			dests: legal_moves(chess),
		},
		turnColor: turn_color_white_or_black(chess),
	});
}
