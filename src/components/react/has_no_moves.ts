import { GameState } from './ChessStudy';

export function has_no_moves(state: GameState): boolean {
	switch (state.master) {
		case 'jgn': {
			return state.jgnStudy.moves.length === 0;
		}
		case 'neo': {
			return !state.neoStudy.root;
		}
	}
}
