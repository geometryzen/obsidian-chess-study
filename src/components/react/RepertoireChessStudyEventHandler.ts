import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { Dispatch, SetStateAction } from 'react';
import { initialize_position } from '../../lib/chess-logic/initialize_position';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_next_moves } from '../../lib/neo/get_next_moves';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { NeoMove } from '../../lib/neo/NeoMove';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { display_relative_move } from '../../lib/ui-state/display_relative_move';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { get_next_move } from '../../lib/neo/get_next_move';
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
function repertoire_user_move_epilog_move(
	user_move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
) {
	const synthetic_moves = get_next_moves(user_move);
	if (synthetic_moves.length > 0) {
		const synthetic_move = random_element(synthetic_moves);
		update_board_view_following_move(user_move, chessView, setChessLogic, state);
		update_board_view_following_move(
			synthetic_move,
			chessView,
			setChessLogic,
			state,
		);
	} else {
		update_board_view_following_move(user_move, chessView, setChessLogic, state);
	}
}

function update_board_view_following_move(
	move: NeoMove,
	chessView: ChessView,
	setChessLogic: Dispatch<SetStateAction<ChessPosition>>,
	state: GameState,
) {
	const pos = new ChessPosition(move.after);
	update_board_view_from_position(chessView, pos);
	setChessLogic(pos);
	state.currentMove = move;
	state.isCommentsHidden = has_next_moves(move);
	state.isNavigationHidden = has_next_moves(move);
	state.isNotationHidden = has_next_moves(move);
}

export class RepertoireChessStudyEventHandler implements ChessStudyEventHandler {
	readonly #chessView: ChessView | null;
	readonly #setChessLogic: React.Dispatch<React.SetStateAction<ChessPosition>>;
	constructor(
		chessView: ChessView | null,
		setChessLogic: React.Dispatch<React.SetStateAction<ChessPosition>>,
	) {
		this.#chessView = chessView;
		this.#setChessLogic = setChessLogic;
	}
	/**
	 * @override
	 */
	setInitialState(
		state: Pick<
			GameState,
			'isCommentsHidden' | 'isNavigationHidden' | 'isNotationHidden'
		>,
		currentMove: MoveToken,
		study: NeoStudy,
	): void {
		// TODO; DRY. Why do we have similar code for reset?
		state.isCommentsHidden = true;
		state.isNavigationHidden = true;
		state.isNotationHidden = true;
		if (!this.#chessView) return;
		if (currentMove) {
			// This seems to cause rendering problems (too may re-renders)
			// const move = getMoveById(study.moves, currentMove.moveId);
			// updateView(this.#chessView, this.#setChessLogic, move.after);
		}
	}
	/**
	 * @override
	 */
	gotoNextMove(state: Readonly<GameState>): MoveToken | null {
		if (!this.#chessView) return null;
		// We mutate the state so it cannot be readonly
		return display_relative_move(state, this.#chessView, this.#setChessLogic, {
			offset: 1,
		});
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: Readonly<GameState>): MoveToken | null {
		if (!this.#chessView) return null;
		// Why do we update the currentMove going backwards but not going forwards?
		return display_relative_move(state, this.#chessView, this.#setChessLogic, {
			offset: -1,
		});
	}
	/**
	 * @override
	 */
	gotoMove(state: Readonly<GameState>, moveId: string): MoveToken | null {
		if (!this.#chessView) return null;

		const neoMove: NeoMove = get_neo_move_by_id(state.study, moveId);
		const pos = new ChessPosition(neoMove.after);
		this.#setChessLogic(pos);
		update_board_view_from_position(this.#chessView, pos);
		return neoMove;
	}
	/**
	 * @override
	 *
	 * @param state
	 * @param m The played move that comes from the user.
	 */
	playMove(state: GameState, m: Move, boardOrientation: 'w' | 'b'): void {
		if (!this.#chessView) return;
		const root = state.study.root;
		if (state.currentMove) {
			const current_move = get_neo_move_by_id(
				state.study,
				state.currentMove.moveId,
			);
			if (m.color === boardOrientation) {
				// The move is being made for the user side.
				// The move must be the first
				const repertoire_move = get_next_move(current_move);
				if (repertoire_move) {
					if (m.san === repertoire_move.san) {
						repertoire_user_move_epilog_move(
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
				// The move is being made for the opponent.
				const repertoire_moves = get_next_moves(current_move);
				// const repertoire_move = get_next_move(current_move);
				if (repertoire_moves.length > 0) {
					const matching_moves = repertoire_moves.filter(
						(move) => m.san === move.san,
					);
					if (matching_moves.length === 1) {
						const repertoire_move = matching_moves[0];
						repertoire_user_move_epilog_move(
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
					repertoire_user_move_epilog_move(
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
	/**
	 * @override
	 */
	reset(state: GameState, initialPosition: string): void {
		if (!this.#chessView) return;

		const { pos } = initialize_position(state.study, initialPosition);
		this.#setChessLogic(pos);
		update_board_view_from_position(this.#chessView, pos);
		// TODO: It seems a bit strange that the computation of the current move does not happen
		// in a more coherent way with the initialization of the position.
		state.currentMove = initial_move_from_neo_study(state.study, initialPosition);
		state.isCommentsHidden = true;
		state.isNavigationHidden = true;
		state.isNotationHidden = true;
	}
	/**
	 * @override
	 */
	shapes(state: GameState): DrawShape[] {
		if (state.currentMove) {
			return state.currentMove.shapes;
		} else {
			return state.study.shapes;
		}
	}
}
