import { NeoMove } from '../tree/NeoMove';
import { NeoStudy } from '../tree/NeoStudy';

export function get_neo_move_by_id(study: NeoStudy, moveId: string): NeoMove {
	if (study.root) {
		const moves: NeoMove[] = [study.root];
		while (moves.length > 0) {
			const move = moves.pop() as NeoMove;
			if (move.id === moveId) {
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
	}
	throw new Error(`moveId ${moveId} must exist in study`);
}
