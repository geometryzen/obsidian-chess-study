import { GameState } from './ChessStudy';

export function has_no_moves(state: Readonly<GameState>): boolean {
	return !state.study.root;
}
