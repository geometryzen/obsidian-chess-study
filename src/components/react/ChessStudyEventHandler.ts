import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { GameState, MoveToken } from './ChessStudy';

export interface ChessStudyEventHandler {
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: MoveToken | null,
		neoStudy: NeoStudy,
		jgnStudy: JgnStudy,
	): void;
	gotoNextMove(state: Readonly<GameState>): MoveToken | null;
	gotoPrevMove(state: GameState): void;
	gotoMove(state: Readonly<GameState>, moveId: string): MoveToken | null;
	/**
	 * TODO: Rename because it is confusing that the move has already been played in the user interface?
	 */
	playMove(state: GameState, playedMove: Move): void;
	/**
	 *
	 */
	shapes(state: GameState): DrawShape[];
}
