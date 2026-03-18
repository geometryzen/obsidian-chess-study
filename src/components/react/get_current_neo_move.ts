import { GameState } from './ChessStudy';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { NeoMove } from '../../lib/neo/NeoMove';

export function get_current_neo_move(
	state: Readonly<GameState>,
): NeoMove | null {
	if (state.currentMove) {
		const currentMove = state.currentMove;
		const moveId = currentMove.moveId;

		if (moveId) {
			return get_neo_move_by_id(state.study, moveId);
		} else {
			return null;
		}
	} else {
		return null;
	}
}
