import { Move } from 'chess.js';
import { GameState } from './GameState';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { DrawShape } from 'chessground/draw';
import { NeoMove } from '../../lib/neo/NeoMove';

export class NoopChessStudyEventHandler implements ChessStudyEventHandler {
	/**
	 * @override
	 */
	setInitialState(state: Pick<GameState, 'isNotationHidden'>): void {
		// Do nothing
	}
	/**
	 * @override
	 */
	gotoNextMove(state: Readonly<GameState>): NeoMove | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: Readonly<GameState>): NeoMove | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	gotoMove(state: Readonly<GameState>, moveId: string): NeoMove | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	playMove(state: GameState, move: Move): void {
		// Do nothing
	}
	reset(state: GameState, initialPosition: string): void {
		// Do nothing
	}
	shapes(state: GameState): DrawShape[] {
		return [];
	}
}
