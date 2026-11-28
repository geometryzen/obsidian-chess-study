import { JSONContent } from '@tiptap/react';
import { GameState } from './GameState';

export function comment_from_chess_study(
	state: Readonly<GameState>,
): JSONContent | null {
	if (state.currentMove) {
		if (state.currentMove.comment) {
			return state.currentMove.comment;
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
