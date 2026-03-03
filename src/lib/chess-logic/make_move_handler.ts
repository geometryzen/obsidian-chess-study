import { Chess, Move, QUEEN } from 'chess.js';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { legal_moves } from './legal_moves';
import { turn_color_white_or_black } from './turn_color_white_or_black';

/**
 * Returns a function that updates the chess model and view based on the move
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function make_move_handler(
	view: Api,
	chess: Chess,
): (from: string, to: string) => Move {
	return (from: string, to: string) => {
		const move = chess.move({ from, to, promotion: QUEEN });

		const viewConfig: Partial<Config> = {
			// I'm not sure what thi does! You can comment it out and not much changes.
			// turnColor: turnColor(chess),
			movable: {
				// Only allow moves by whoevers turn it is.
				color: turn_color_white_or_black(chess),
				// Only allow legal moves.
				dests: legal_moves(chess),
			},
			// this highlights the checked king in red.
			check: chess.isCheck(),
		};

		if (move.isEnPassant() || move.promotion) {
			// Handle En Passant && Promote to Queen by default
			view.set({
				fen: chess.fen(),
				...viewConfig,
			});
		} else {
			view.set(viewConfig);
		}

		return move;
	};
}
