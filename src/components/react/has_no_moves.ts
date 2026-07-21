import { GameState } from './GameState';

/**
 * Determines whether the chessStudy property of the game state has any moves.
 */
export function has_no_moves(state: Readonly<GameState>): boolean {
	return !state.chessStudy.root;
}
