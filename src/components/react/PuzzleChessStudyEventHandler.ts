import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { Dispatch, SetStateAction } from 'react';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_next_move } from '../../lib/neo/get_next_move';
import { get_next_moves } from '../../lib/neo/get_next_moves';
import { NeoMove } from '../../lib/neo/NeoMove';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { initialize_position } from '../../lib/chess-logic/initialize_position';
import { has_next_moves } from '../../lib/neo/has_next_moves';

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
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
) {
	const synthetic_moves = get_next_moves(user_move);
	if (synthetic_moves.length > 0) {
		const synthetic_move = random_element(synthetic_moves);
		const pos = new ChessPosition(synthetic_move.after);
		update_board_view_from_position(chessView, pos);
		setChessLogic(pos);
		state.currentMove = synthetic_move;
		state.isNotationHidden = has_next_moves(synthetic_move);
	} else {
		const pos = new ChessPosition(user_move.after);
		update_board_view_from_position(chessView, pos);
		setChessLogic(pos);
		state.currentMove = user_move;
		state.isNotationHidden = false;
	}
}

export class PuzzleChessStudyEventHandler implements ChessStudyEventHandler {
	readonly #chessView: ChessView | null;
	readonly #chessLogic: ChessPosition;
	readonly #setChessLogic: Dispatch<SetStateAction<ChessPosition>>;
	constructor(
		chessView: ChessView | null,
		chessLogic: ChessPosition,
		setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	) {
		this.#chessView = chessView;
		this.#chessLogic = chessLogic;
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
					const pos = new ChessPosition(current_move.after);
					update_board_view_from_position(this.#chessView, pos);
					this.#setChessLogic(pos);
				}
			} else {
				// There are no following moves.
				const pos = new ChessPosition(current_move.after);
				update_board_view_from_position(this.#chessView, pos);
				this.#setChessLogic(pos);
			}
		} else {
			// There is no current move.
			// This can happen in puzzles when the move that gave rise to the position is not known.
			if (root === null) {
				// If there are no moves, then this is not a puzzle!
				// Update the view to revert the position.
				// There is no change in state.
				const pos = new ChessPosition(state.study.rootFEN);
				update_board_view_from_position(this.#chessView, pos);
				this.#setChessLogic(pos);
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
					const pos = new ChessPosition(state.study.rootFEN);
					update_board_view_from_position(this.#chessView, pos);
					this.#setChessLogic(pos);
				}
			}
		}
	}
	reset(state: GameState, initialPosition: string): void {
		if (!this.#chessView) return;

		const { pos } = initialize_position(state.study, initialPosition);
		this.#setChessLogic(pos);
		update_board_view_from_position(this.#chessView, pos);
		// TODO: It seems a bit strange that the computation of the current move does not happen
		// in a more coherent way with the initialization of the position.
		state.currentMove = initial_move_from_neo_study(state.study, initialPosition);
		state.isNotationHidden = true;
	}
	shapes(state: GameState): DrawShape[] {
		return [];
	}
}
