import { Move } from 'chess.js';
import { GameCurrentMove, GameState } from './ChessStudy';
import { ChessStudyFileContent } from '../../lib/store';
import { DrawShape } from 'chessground/draw';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: GameCurrentMove,
		study: ChessStudyFileContent,
	): void;
	gotoNextMove(state: GameState): void;
	gotoPrevMove(state: GameState): void;
	gotoMove(state: GameState, moveId: string): void;
	/**
	 * TODO: Rename because it is confusing that the move has already been played in the user interface?
	 */
	playMove(state: GameState, playedMove: Move): void;
	/**
	 *
	 */
	shapes(state: GameState): DrawShape[];
}
