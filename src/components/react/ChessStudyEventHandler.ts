import { Move } from 'chess.js';
import { GameCurrentMove, GameState } from './ChessStudy';
import { ChessStudyFileContent } from 'src/lib/storage';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: GameCurrentMove,
		study: ChessStudyFileContent,
	): void;
	gotoNextMove(state: GameState): void;
	gotoPrevMove(state: GameState): void;
	gotoMove(state: GameState, moveId: string): void;
	playMove(state: GameState, move: Move): void;
}
