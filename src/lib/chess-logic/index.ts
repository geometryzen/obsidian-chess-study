import { Chess, QUEEN, SQUARES, Square } from 'chess.js';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { getChessDataFormat } from '../fen-or-pgn';

export function toColor(chess: Chess) {
	return chess.turn() === 'w' ? 'white' : 'black';
}

export function toDests(chess: Chess): Map<Square, Square[]> {
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

export function playOtherSide(cg: Api, chess: Chess) {
	return (orig: string, dest: string) => {
		const move = chess.move({ from: orig, to: dest, promotion: QUEEN });

		const commonTurnProperties: Partial<Config> = {
			turnColor: toColor(chess),
			movable: {
				color: toColor(chess),
				dests: toDests(chess),
			},
			check: chess.isCheck(),
		};

		if (move.isEnPassant() || move.promotion) {
			//Handle En Passant && Promote to Queen by default
			cg.set({
				fen: chess.fen(),
				...commonTurnProperties,
			});
		} else {
			cg.set(commonTurnProperties);
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
