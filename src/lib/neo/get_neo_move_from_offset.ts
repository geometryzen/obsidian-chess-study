import { get_next_move } from './get_next_move';
import { get_prev_move } from './get_prev_move';
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
				return get_next_move(node);
			}
			case -1: {
				return get_prev_move(study.root, node);
			}
			default: {
				throw new Error();
			}
		}
	} else {
		return null;
	}
}
