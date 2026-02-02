import { Move } from 'chess.js';
import { GameState } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';

export class NoopChessStudyEventHandler implements ChessStudyEventHandler {
	/**
	 * @override
	 */
	gotoNextMove(state: GameState): void {
		// Do nothing
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: GameState): void {
		// Do nothing
	}
	/**
	 * @override
	 */
	gotoMove(state: GameState, moveId: string): void {
		// Do nothing
	}
	/**
	 * @override
	 */
	playMove(state: GameState, move: Move): void {
		// Do nothing
	}
}
