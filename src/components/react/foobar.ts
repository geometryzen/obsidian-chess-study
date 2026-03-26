import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_main_line } from '../../lib/neo/get_neo_main_line';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { Chess as ChessPosition } from 'chess.js';

export function initialize_position(
	study: NeoStudy,
	initialPosition: string,
): ChessPosition {
	const position = new ChessPosition(study.rootFEN);
	switch (initialPosition) {
		case 'end': {
			get_neo_main_line(study).forEach((move) => {
				position.move({
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
				position.move({
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
					position.move({
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
	return position;
}
