import { get_target_move } from './get_target_move';
import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';

/**
 * Determones whether the source move exists in the target study.
 */
export function exists_target_move(
	sourceMove: NeoMove | null,
	sourceStudy: NeoStudy,
	targetStudy: NeoStudy | null,
): boolean {
	const target_move = get_target_move(
		sourceMove,
		sourceStudy,
		targetStudy,
		null,
	);
	if (target_move) {
		return true;
	} else {
		return false;
	}
}
