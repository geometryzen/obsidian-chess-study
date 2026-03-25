import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_next_move } from '../../lib/neo/get_next_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { NeoMove } from '../../lib/neo/NeoMove';
import { update_view_and_logic } from '../../lib/ui-state/update_view_and_logic';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { get_next_moves } from '../../lib/neo/get_next_moves';
import { Dispatch, SetStateAction } from 'react';

export function random_element<T>(xs: T[]): T {
	return xs[Math.floor(Math.random() * xs.length)];
}

/**
 * Plays a response (or completes the puzzle) in response to the user's move.
 * If the puzzle has multiple possible responses then a random one is chosen.
 * If there are no more response moves then the state ends with the user's move and the notation is made visible.
 * @param user_move
 * @param chessView
 * @param setChessLogic
 * @param state
 */
function play_synthetic_move(
	user_move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessJs>>,
	state: GameState,
) {
	const synthetic_moves = get_next_moves(user_move);
	if (synthetic_moves.length > 0) {
		const synthetic_move = random_element(synthetic_moves);
		update_view_and_logic(chessView, setChessLogic, synthetic_move.after);
		state.currentMove = synthetic_move;
	} else {
		update_view_and_logic(chessView, setChessLogic, user_move.after);
		state.currentMove = user_move;
		state.isNotationHidden = false;
	}
}

export class PuzzleChessStudyEventHandler implements ChessStudyEventHandler {
	readonly #chessView: ChessView | null;
	readonly #setChessLogic: Dispatch<SetStateAction<ChessJs>>;
	constructor(
		chessView: ChessView | null,
		setChessLogic: Dispatch<SetStateAction<ChessJs>>,
	) {
		this.#chessView = chessView;
		this.#setChessLogic = setChessLogic;
	}
	/**
	 * @override
	 */
	setInitialState(state: Pick<GameState, 'isNotationHidden'>): void {
		state.isNotationHidden = true;
	}
	/**
	 * @override
	 */
	gotoNextMove(state: Readonly<GameState>): MoveToken | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: Readonly<GameState>): MoveToken | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	gotoMove(state: Readonly<GameState>, moveId: string): MoveToken | null {
		// Do nothing
		return null;
	}
	/**
	 * @override
	 */
	playMove(state: GameState, m: Move): void {
		if (!this.#chessView) return;
		const root = state.study.root;
		if (state.currentMove) {
			const current_move = get_neo_move_by_id(
				state.study,
				state.currentMove.moveId,
			);
			// TODO: There may be several move choices that the user is allowed to make due to variations.
			const repertoire_move = get_next_move(current_move);
			if (repertoire_move) {
				if (m.san === repertoire_move.san) {
					play_synthetic_move(
						repertoire_move,
						this.#chessView,
						this.#setChessLogic,
						state,
					);
				} else {
					// There is a current move.
					// A move was made that did not match the puzzle.
					// Revert to the position after the current move.
					update_view_and_logic(
						this.#chessView,
						this.#setChessLogic,
						current_move.after,
					);
				}
			} else {
				// There are no following moves.
				update_view_and_logic(
					this.#chessView,
					this.#setChessLogic,
					current_move.after,
				);
			}
		} else {
			// There is no current move.
			// This can happen in puzzles when the move that gave rise to the position is not known.
			if (root === null) {
				// If there are no moves, then this is not a puzzle!
				// Update the view to revert the position.
				// There is no change in state.
				update_view_and_logic(
					this.#chessView,
					this.#setChessLogic,
					state.study.rootFEN,
				);
			} else {
				// TODO: Generalize to first_neo_moves so as to include variations. YES
				// However, generally we are looking for only one move in a puzzle.
				const first_move = first_neo_move(state.study) as NeoMove;
				if (first_move.san === m.san) {
					play_synthetic_move(
						first_move,
						this.#chessView,
						this.#setChessLogic,
						state,
					);
				} else {
					// It's not the correct move
					// There is no current move so we are at the beginning of the game.
					// Additionally, the move made did not match the first so we revert to the root position.
					update_view_and_logic(
						this.#chessView,
						this.#setChessLogic,
						state.study.rootFEN,
					);
				}
			}
		}
	}
	shapes(state: GameState): DrawShape[] {
		return [];
	}
}
