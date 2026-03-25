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

export function random_element<T>(xs: T[]): T {
	return xs[Math.floor(Math.random() * xs.length)];
}

export class PuzzleChessStudyEventHandler implements ChessStudyEventHandler {
	readonly #chessView: ChessView | null;
	readonly #setChessLogic: React.Dispatch<React.SetStateAction<ChessJs>>;
	constructor(
		chessView: ChessView | null,
		setChessLogic: React.Dispatch<React.SetStateAction<ChessJs>>,
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
			const repertoire_move = get_next_move(current_move);
			if (repertoire_move) {
				if (m.san === repertoire_move.san) {
					const generated_moves = get_next_moves(repertoire_move);
					if (generated_moves.length > 0) {
						const generated_move = random_element(generated_moves);
						update_view_and_logic(
							this.#chessView,
							this.#setChessLogic,
							generated_move.after,
						);
						state.currentMove = generated_move;
					} else {
						update_view_and_logic(
							this.#chessView,
							this.#setChessLogic,
							repertoire_move.after,
						);
						state.currentMove = repertoire_move;
						state.isNotationHidden = false;
					}
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
				// TODO: Generalize to first_neo_moves so as to include variations
				const first_move = first_neo_move(state.study) as NeoMove;
				if (first_move.san === m.san) {
					const reply_move = get_next_move(first_move);
					if (reply_move) {
						update_view_and_logic(
							this.#chessView,
							this.#setChessLogic,
							reply_move.after,
						);
						state.currentMove = reply_move;
					} else {
						update_view_and_logic(
							this.#chessView,
							this.#setChessLogic,
							first_move.after,
						);
						state.currentMove = first_move;
					}
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
