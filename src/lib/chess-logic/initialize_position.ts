import { first_neo_move } from '../neo/first_neo_move';
import { get_neo_main_line } from '../neo/get_neo_main_line';
import { initial_move_from_neo_study } from '../neo/initial_node_from_neo_study';
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
			if (desiredMove) {
				const moves = get_neo_main_line(study);
				for (let i = 0; i < moves.length; i++) {
					const move = moves[i];
					pos.move({
						from: move.from,
						to: move.to,
						promotion: move.promotion,
					});
					if (desiredMove.moveId === move.moveId) {
						break;
					}
				}
			}
		}
	}
	return { pos, rootMoveNumber };
}
