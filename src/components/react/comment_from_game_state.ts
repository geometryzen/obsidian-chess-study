import { JSONContent } from '@tiptap/react';
import { GameState } from './GameState';
import { comment_from_chess_study } from './comment_from_chess_study';
import { get_target_move } from '../../lib/neo/get_target_move';

/**
 * If there us a current move then we return the comment for that move,
 * Otherwise we return the comment for the study itself.
 */
export function comment_from_game_state(
	state: Readonly<GameState>,
): JSONContent | null {
	if (state.repertoire) {
		if (state.currentChessStudyMove) {
			// console.lg(`currentChessStudyMove is defined: ${state.currentChessStudyMove.san}`);
		} else {
			// console.lg('currentChessStudyMove is NOT defined');
		}
		const currentRepertoireMove = get_target_move(
			state.currentChessStudyMove,
			state.chessStudy,
			state.repertoire,
			null,
		);
		if (currentRepertoireMove) {
			if (currentRepertoireMove.comment) {
				return currentRepertoireMove.comment;
			} else {
				if (state.currentChessStudyMove) {
					if (state.currentChessStudyMove.comment) {
						return state.currentChessStudyMove.comment;
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		} else {
			// console.lg('currentRepertoireMove is NOT defined');
			// We are out of repertoire.
			return comment_from_chess_study(state);
		}
	} else {
		// console.lg('There is no repertoire defined.');
		// There is no repertoire file so the only thing that makes sense is to use the chessStudy.
		return comment_from_chess_study(state);
	}
}
