import { NeoMove } from '../../lib/tree/NeoMove';
import { NeoStudy } from '../../lib/tree/NeoStudy';

export function first_neo_move(neoStudy: NeoStudy): NeoMove | null {
	return neoStudy.root;
}
