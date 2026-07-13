import { GameState } from './ChessStudy';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { NeoMove } from '../../lib/neo/NeoMove';

export function get_current_chessstudy_move(
	state: Readonly<GameState>,
): NeoMove | null {
	if (state.currentChessStudyMove) {
		const currentMove = state.currentChessStudyMove;
		const moveId = currentMove.moveId;

		if (moveId) {
			return get_neo_move_by_id(state.chessStudy, moveId);
		} else {
			return null;
		}
	} else {
		return null;
	}
}
