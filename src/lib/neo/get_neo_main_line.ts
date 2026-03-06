import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

export function get_neo_main_line(study: NeoStudy): NeoMove[] {
	if (study.root) {
		const moves: NeoMove[] = [study.root];
		let move = study.root;
		while (move.left) {
			move = move.left;
			moves.push(move);
		}
		return moves;
	} else {
		return [];
	}
}
