import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { Dispatch, SetStateAction } from 'react';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_next_move } from '../../lib/neo/get_next_move';
import { has_next_moves } from '../../lib/neo/has_next_moves';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { NeoMove } from '../../lib/neo/NeoMove';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { initialize_position } from '../../lib/chess-logic/initialize_position';

function play_mainline_move(
	user_move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
) {
	const mainline_move = get_next_move(user_move);
	if (mainline_move) {
		const pos = new ChessPosition(mainline_move.after);
		update_board_view_from_position(chessView, pos);
		setChessLogic(pos);
		state.currentMove = mainline_move;
		state.isNotationHidden = has_next_moves(mainline_move);
	} else {
		const pos = new ChessPosition(user_move.after);
		update_board_view_from_position(chessView, pos);
		setChessLogic(pos);
		state.currentMove = user_move;
		state.isNotationHidden = false;
	}
}

export class MemorizeChessStudyEventHandler implements ChessStudyEventHandler {
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
			// The user is expected to play the main line move.
			const expected_move = get_next_move(current_move);
			if (expected_move) {
				if (m.san === expected_move.san) {
					play_mainline_move(
						expected_move,
						this.#chessView,
						this.#setChessLogic,
						state,
					);
				} else {
					// There is a current move.
					// A move was made that did not match the main line.
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
					play_mainline_move(
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
