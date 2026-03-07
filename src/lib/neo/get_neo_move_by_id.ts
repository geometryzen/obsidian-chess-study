import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

export function get_neo_move_by_id(
	study: Readonly<NeoStudy>,
	moveId: string,
): NeoMove {
	if (study.root) {
		const moves: NeoMove[] = [study.root];
		while (moves.length > 0) {
			const move = moves.pop() as NeoMove;
			if (move.moveId === moveId) {
				return move;
			} else {
				if (move.left) {
					moves.push(move.left);
				}
				if (move.right) {
					moves.push(move.right);
				}
			}
		}
		throw new Error(`move with id ${moveId} must exist in the study.`);
	} else {
		throw new Error('study must have a root.');
	}
}
