import { Chess, QUEEN, SQUARES, Square } from 'chess.js';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { getChessDataFormat } from '../fen-or-pgn';
import { turnColor } from '../turnColor';

/**
 * Gets the set of legal moves for the current position.
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function legalMoves(chess: Chess): Map<Square, Square[]> {
	const dests = new Map();
	SQUARES.forEach((s) => {
		const ms = chess.moves({ square: s, verbose: true });
		if (ms.length)
			dests.set(
				s,
				ms.map((m) => m.to),
			);
	});
	return dests;
}

/**
 * Returns a function that updates the chess model and view based on the move
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function playOtherSide(view: Api, chess: Chess) {
	return (from: string, to: string) => {
		const move = chess.move({ from, to, promotion: QUEEN });

		const viewConfig: Partial<Config> = {
			// I'm not sure what thi does! You can comment it out and not much changes.
			// turnColor: turnColor(chess),
			movable: {
				// Only allow moves by whoevers turn it is.
				color: turnColor(chess),
				// Only allow legal moves.
				dests: legalMoves(chess),
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

export function parseChessString(chessStringTrimmed: string): {
	chess: Chess;
	format: 'FEN' | 'PGN';
} {
	const format = getChessDataFormat(chessStringTrimmed);
	switch (format) {
		case 'FEN': {
			return { chess: new Chess(chessStringTrimmed), format };
		}
		case 'PGN': {
			const chess = new Chess();

			chess.loadPgn(chessStringTrimmed, {
				strict: false,
			});
			return { chess, format };
		}
		default: {
			throw new Error('Chess string must be FEN or PGN.');
		}
	}
}
