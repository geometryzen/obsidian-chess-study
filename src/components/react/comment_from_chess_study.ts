import { JSONContent } from '@tiptap/react';
import { GameState } from './GameState';

export function comment_from_chess_study(
	state: Readonly<GameState>,
): JSONContent | null {
	if (state.currentChessStudyMove) {
		if (state.currentChessStudyMove.comment) {
			return state.currentChessStudyMove.comment;
		} else {
			return null;
		}
	} else {
		if (state.chessStudy.comment) {
			return state.chessStudy.comment;
		} else {
			return null;
		}
	}
}
