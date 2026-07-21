import { JSONContent } from '@tiptap/react';
import { GameState } from './GameState';

const repertoire_takes_precedence = true;

/**
 * If there us a current move then we return the comment for that move,
 * Otherwise we return the comment for the study itself.
 */
export function comment_from_game_state(
	state: Readonly<GameState>,
): JSONContent | null {
	if (repertoire_takes_precedence) {
		if (state.currentRepertoireMove) {
			if (state.currentRepertoireMove.comment) {
				return state.currentRepertoireMove.comment;
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
			if (state.repertoire) {
				if (state.repertoire.comment) {
					return state.repertoire.comment;
				} else {
					if (state.chessStudy) {
						if (state.chessStudy.comment) {
							return state.chessStudy.comment;
						} else {
							return null;
						}
					} else {
						return null;
					}
				}
			} else {
				if (state.chessStudy.comment) {
					return state.chessStudy.comment;
				} else {
					return null;
				}
			}
		}
	} else {
		if (state.currentChessStudyMove) {
			if (state.currentChessStudyMove.comment) {
				return state.currentChessStudyMove.comment;
			} else {
				if (state.currentRepertoireMove) {
					if (state.currentRepertoireMove.comment) {
						return state.currentRepertoireMove.comment;
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		} else {
			if (state.chessStudy.comment) {
				return state.chessStudy.comment;
			} else {
				if (state.repertoire) {
					if (state.repertoire.comment) {
						return state.repertoire.comment;
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		}
	}
}
