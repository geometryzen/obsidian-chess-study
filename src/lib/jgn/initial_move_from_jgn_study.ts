import { parse, ParseTree } from '@mliebelt/pgn-parser';
import {
	INITIAL_POSITION_BEGIN,
	INITIAL_POSITION_END,
	INITIAL_POSITION_FIRST,
	InitialPosition,
} from '../config/InitialPosition';
import { JgnMove } from './JgnMove';
import { JgnStudy } from './JgnStudy';

export function initial_move_from_jgn_study(
	study: JgnStudy,
	initialPosition: InitialPosition,
): JgnMove | null {
	switch (initialPosition) {
		case INITIAL_POSITION_BEGIN: {
			return null;
		}
		case INITIAL_POSITION_FIRST: {
			const moves = study.moves;
			return moves[0] ?? null;
		}
		case INITIAL_POSITION_END: {
			const moves = study.moves;
			return moves[moves.length - 1] ?? null;
		}
		default: {
			const moves = study.moves;
			// We are currently defaulting to the last move (legacy behavior)
			const game = parse(initialPosition, { startRule: 'game' }) as ParseTree;
			if (Array.isArray(game.moves)) {
				const ipmoves = game.moves;
				if (ipmoves.length === 1) {
					const ipmove = ipmoves[0];
					const moveNumber = ipmove.moveNumber;
					// The PGN parsing library seems to get the color wrong.
					const turn = initialPosition.includes('...') ? 'b' : 'w';
					// The following needs refinement for when the first move does not start at 1.
					const index =
						turn === 'w' ? 2 * (moveNumber - 1) : 2 * (moveNumber - 1) + 1;
					const move = moves[index];
					return move;
				}
			}
			return moves[moves.length - 1] ?? null;
		}
	}
}
