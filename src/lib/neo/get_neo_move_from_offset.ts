import { get_move_next } from './get_move_next';
import { get_move_prev } from './get_move_prev';
import { get_neo_move_by_id } from './get_neo_move_by_id';
import { NeoStudy } from './NeoStudy';

export function get_neo_move_from_offset(
	study: NeoStudy,
	moveId: string,
	offset: 1 | -1,
) {
	const node = get_neo_move_by_id(study, moveId);
	console.log('get_neo_move_from_offset', 'node.san', node.san);
	switch (offset) {
		case 1: {
			const next = get_move_next(node);
			if (next) {
				console.log('get_neo_move_from_offset', 'next.san', next.san);
			}
			return next;
		}
		case -1: {
			const prev = get_move_prev(study.root, node);
			if (prev) {
				console.log('get_neo_move_from_offset', 'prev.san', prev.san);
			}
			return prev;
		}
		default: {
			throw new Error();
		}
	}
}
