import { Chess, Square, SQUARES } from 'chess.js';

/**
 * Gets the set of legal moves for the current position.
 *
 * @see https://github.com/ornicar/chessground-examples
 */
export function legal_moves(chess: Chess): Map<Square, Square[]> {
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
