import { bfsGeneratorLR } from './bfsGeneratorLR';
import { NeoStudy } from './NeoStudy';

export function has_neo_move_by_id(study: NeoStudy, moveId: string): boolean {
	const nodes = bfsGeneratorLR(study.root);
	for (const node of nodes) {
		if (node.moveId === moveId) {
			return true;
		}
	}
	return false;
}
