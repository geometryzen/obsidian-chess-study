import { moves_from_path } from './move_from_path';
import { NeoMove } from './NeoMove';
import { NeoStudy } from './NeoStudy';
import { path_from_move } from './path_from_move';

export function get_target_move(
	sourceMove: NeoMove | null,
	sourceStudy: NeoStudy,
	targetStudy: NeoStudy | null,
) {
	const sans = path_from_move(sourceStudy.root, sourceMove);
	const moves = moves_from_path(targetStudy?.root, sans);
	if (moves.length == sans.length) {
		return moves[moves.length - 1];
	} else {
		return null;
	}
}
