import { first_neo_move } from '../neo/first_neo_move';
import { get_neo_main_line } from '../neo/get_neo_main_line';
import { get_prev_move } from '../neo/get_prev_move';
import { initial_move_from_neo_study } from '../neo/initial_node_from_neo_study';
import { NeoMove } from '../neo/NeoMove';
import { NeoStudy } from '../neo/NeoStudy';
import { Chess as ChessPosition } from 'chess.js';

export function initialize_position(
	study: NeoStudy,
	initialPosition: string,
): { pos: ChessPosition; rootMoveNumber: number } {
	const pos = new ChessPosition(study.rootFEN);
	const rootMoveNumber = pos.moveNumber();
	switch (initialPosition) {
		case 'end': {
			get_neo_main_line(study).forEach((move) => {
				pos.move({
					from: move.from,
					to: move.to,
					promotion: move.promotion,
				});
			});
			break;
		}
		case 'first': {
			const move = first_neo_move(study);
			if (move) {
				pos.move({
					from: move.from,
					to: move.to,
					promotion: move.promotion,
				});
			}
			break;
		}
		case 'begin': {
			// Do nothing.
			break;
		}
		default: {
			const desiredMove = initial_move_from_neo_study(study, initialPosition);
			// Construct the moves leading to and including the desired move.
			const moves: NeoMove[] = [];
			let move: NeoMove | null = desiredMove;
			while (move) {
				moves.push(move);
				move = get_prev_move(study.root, move);
			}
			moves.reverse();
			if (desiredMove) {
				for (let i = 0; i < moves.length; i++) {
					const move = moves[i];
					pos.move({
						from: move.from,
						to: move.to,
						promotion: move.promotion,
					});
				}
			}
		}
	}
	return { pos, rootMoveNumber };
}
