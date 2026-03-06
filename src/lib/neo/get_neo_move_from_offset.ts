import { get_move_next } from './get_move_next';
import { get_move_prev } from './get_move_prev';
import { get_neo_move_by_id } from './get_neo_move_by_id';
import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

export function get_neo_move_from_offset(
	study: NeoStudy,
	moveId: string,
	offset: 1 | -1,
): NeoMove | null {
	const node = get_neo_move_by_id(study, moveId);
	if (node) {
		switch (offset) {
			case 1: {
				return get_move_next(node);
			}
			case -1: {
				return get_move_prev(study.root, node);
			}
			default: {
				throw new Error();
			}
		}
	} else {
		return null;
	}
}
