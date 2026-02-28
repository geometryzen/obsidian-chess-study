import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { NeoStudy } from '../../lib/tree/NeoStudy';
import { GameState, MoveToken } from './ChessStudy';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: MoveToken | null,
		model: NeoStudy,
		study: JgnStudy,
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
