import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

export function first_neo_move(study: NeoStudy): NeoMove | null {
	return study.root;
}
