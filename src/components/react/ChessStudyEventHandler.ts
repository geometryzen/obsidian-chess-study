import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { NeoStudy } from '../../lib/neo/NeoStudy.js';
import { GameState } from './ChessStudy.js';
import { CompletedPosition } from '../../lib/config/CompletedPosition.js';
import { NeoMove } from '../../lib/neo/NeoMove.js';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: NeoMove | null,
		neoStudy: NeoStudy,
	): void;
	gotoNextMove(state: Readonly<GameState>): NeoMove | null;
	gotoPrevMove(state: Readonly<GameState>): NeoMove | null;
	gotoMove(state: Readonly<GameState>, moveId: string): NeoMove | null;
	/**
	 * TODO: Rename because it is confusing that the move has already been played in the user interface?
	 * Maybe just call this onMove
	 */
	playMove(
		state: GameState,
		playedMove: Move,
		boardOrientation: 'w' | 'b',
		completedPosition: CompletedPosition,
	): void;
	/**
	 *
	 */
	reset(state: GameState, initialPosition: string): void;
	/**
	 *
	 */
	shapes(state: GameState): DrawShape[];
}
