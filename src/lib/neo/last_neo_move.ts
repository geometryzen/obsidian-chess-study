import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

export function last_neo_move(study: NeoStudy): NeoMove | null {
	if (study.root) {
		let node = study.root;
		while (node.left) {
			node = node.left;
		}
		return node;
	} else {
		return null;
	}
}
