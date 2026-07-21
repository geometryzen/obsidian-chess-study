import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { Dispatch, SetStateAction } from 'react';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_next_moves } from '../../lib/neo/get_next_moves';
import { NeoMove } from '../../lib/neo/NeoMove';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { initialize_position } from '../../lib/chess-logic/initialize_position';
import { has_next_moves } from '../../lib/neo/has_next_moves';
import { is_correct_move } from '../../lib/neo/is_questionable_move';
import { CompletedPosition } from '../../lib/config/CompletedPosition';
import { get_target_move } from '../../lib/neo/get_target_move';
import { GameState } from './GameState';

export function random_element<T>(xs: T[]): T {
	return xs[Math.floor(Math.random() * xs.length)];
}

function terminate_puzzle(
	user_move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
) {
	const pos = new ChessPosition(user_move.after);
	update_board_view_from_position(chessView, pos);
	setChessLogic(pos);
	state.currentChessStudyMove = user_move;
	state.currentRepertoireMove = get_target_move(
		state.currentChessStudyMove,
		state.chessStudy,
		state.repertoire,
	);
	state.isNotationHidden = false;
	return;
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
function play_response_move_or_terminate_puzzle(
	user_move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
	currentPosition: string,
	completedPosition: CompletedPosition,
) {
	if (currentPosition === completedPosition) {
		// The user's move completes the puzzle.
		terminate_puzzle(user_move, chessView, setChessLogic, state);
	} else {
		// The possible moves that can be played in response are the main move and all of the variations.
		const response_moves = get_next_moves(user_move);
		if (response_moves.length > 0) {
			// Pick one of the response moves at random.
			const response_move = random_element(response_moves);
			if (response_move.after === completedPosition) {
				terminate_puzzle(response_move, chessView, setChessLogic, state);
			} else {
				const pos = new ChessPosition(response_move.after);
				update_board_view_from_position(chessView, pos);
				setChessLogic(pos);
				state.currentChessStudyMove = response_move;
				state.currentRepertoireMove = get_target_move(
					state.currentChessStudyMove,
					state.chessStudy,
					state.repertoire,
				);
				state.isNotationHidden = has_next_moves(response_move);
			}
		} else {
			// There are no response moves.
			// The puzzle has been completed.
			terminate_puzzle(user_move, chessView, setChessLogic, state);
		}
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
	playMove(
		state: GameState,
		m: Move,
		boardOrientation: 'w' | 'b',
		completedPosition: CompletedPosition,
	): void {
		if (!this.#chessView) return;
		const root = state.chessStudy.root;
		if (state.currentChessStudyMove) {
			const current_move = get_neo_move_by_id(
				state.chessStudy,
				state.currentChessStudyMove.moveId,
			);
			// There may be several move choices that the user is allowed to make due to variations.
			// Make sure that the user plays only correct moves.
			const variations = get_next_moves(current_move);
			const correct_moves = variations.filter((variation) =>
				is_correct_move(variation),
			);
			if (correct_moves.length > 0) {
				const matching_moves = correct_moves.filter(
					(correct_move) => correct_move.san === m.san,
				);
				if (matching_moves.length === 1) {
					const matching_move = matching_moves[0];
					play_response_move_or_terminate_puzzle(
						matching_move,
						this.#chessView,
						this.#setChessLogic,
						state,
						this.#chessLogic.fen(),
						completedPosition,
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
				const pos = new ChessPosition(state.chessStudy.rootFEN);
				update_board_view_from_position(this.#chessView, pos);
				this.#setChessLogic(pos);
			} else {
				// TODO: Generalize to first_neo_moves so as to include variations. YES
				// However, generally we are looking for only one move in a puzzle.
				const first_move = first_neo_move(state.chessStudy) as NeoMove;
				if (first_move.san === m.san) {
					play_response_move_or_terminate_puzzle(
						first_move,
						this.#chessView,
						this.#setChessLogic,
						state,
						this.#chessLogic.fen(),
						completedPosition,
					);
				} else {
					// It's not the correct move
					// There is no current move so we are at the beginning of the game.
					// Additionally, the move made did not match the first so we revert to the root position.
					const pos = new ChessPosition(state.chessStudy.rootFEN);
					update_board_view_from_position(this.#chessView, pos);
					this.#setChessLogic(pos);
				}
			}
		}
	}
	reset(state: GameState, initialPosition: string): void {
		if (!this.#chessView) return;

		const { pos } = initialize_position(state.chessStudy, initialPosition);
		this.#setChessLogic(pos);
		update_board_view_from_position(this.#chessView, pos);
		// TODO: It seems a bit strange that the computation of the current move does not happen
		// in a more coherent way with the initialization of the position.
		state.currentChessStudyMove = initial_move_from_neo_study(
			state.chessStudy,
			initialPosition,
		);
		state.currentRepertoireMove = get_target_move(
			state.currentChessStudyMove,
			state.chessStudy,
			state.repertoire,
		);
		state.isNotationHidden = true;
	}
	shapes(state: GameState): DrawShape[] {
		return [];
	}
}
