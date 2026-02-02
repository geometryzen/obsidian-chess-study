import { Move } from 'chess.js';
import { GameState } from './ChessStudy';

export interface ChessStudyEventHandler {
	setInitialState(state: Pick<GameState, 'isNotationHidden'>): void;
	gotoNextMove(state: GameState): void;
	gotoPrevMove(state: GameState): void;
	gotoMove(state: GameState, moveId: string): void;
	playMove(state: GameState, move: Move): void;
}
