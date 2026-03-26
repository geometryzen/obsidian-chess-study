import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { GameState, MoveToken } from './ChessStudy';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: MoveToken | null,
		neoStudy: NeoStudy,
	): void;
	gotoNextMove(state: Readonly<GameState>): MoveToken | null;
	gotoPrevMove(state: Readonly<GameState>): MoveToken | null;
	gotoMove(state: Readonly<GameState>, moveId: string): MoveToken | null;
	/**
	 * TODO: Rename because it is confusing that the move has already been played in the user interface?
	 */
	playMove(state: GameState, playedMove: Move): void;
	/**
	 *
	 */
	reset(state: GameState, initialPosition: string): void;
	/**
	 *
	 */
	shapes(state: GameState): DrawShape[];
}
