import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { find_move_index_from_move_id } from '../../lib/jgn/find_move_index_from_move_id';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_move_next } from '../../lib/neo/get_move_next';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { NeoMove } from '../../lib/neo/NeoMove';
import { update_view_and_logic } from '../../lib/ui-state/update_view_and_logic';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';

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
	gotoPrevMove(state: GameState): void {
		// Do nothing
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
		switch (state.master) {
			case 'jgn': {
				const moves = state.jgnStudy.moves;
				if (state.currentMove) {
					const currentMoveId = state.currentMove.moveId;
					const currentMoveIndex = moves.findIndex(
						(move) => move.moveId === currentMoveId,
					);

					// How does moveIndex differ from currentMoveIndex?
					// I believe it is the same, assuming we don't have variants.
					const { indexLocation: variant, moveIndex } = find_move_index_from_move_id(
						moves,
						currentMoveId,
					);
					// console.lg('currentMoveIndex', currentMoveIndex);
					// console.lg('moveIndex', moveIndex);

					if (variant) {
						// handle Variation
						// This may be a future feature.
					} else {
						// handle Main Line
						const is_last_move = currentMoveIndex === moves.length - 1;

						if (is_last_move) {
							// The user is trying to move the opponent's piece!
							update_view_and_logic(
								this.#chessView,
								this.#setChessLogic,
								moves[moveIndex].after,
							);
						} else {
							// check if the next move is the same move
							const next_move = moves[moveIndex + 1];

							if (next_move.san === m.san) {
								const reply_move = moves[moveIndex + 2];
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
										next_move.after,
									);
									state.currentMove = next_move;
									state.isNotationHidden = false;
								}
							} else {
								// There is a current move.
								// A move was made that did not match the puzzle.
								// Revert to the position after the current move.
								update_view_and_logic(
									this.#chessView,
									this.#setChessLogic,
									moves[moveIndex].after,
								);
							}
						}
					}
				} else {
					// There is no current move.
					// This means we are positioned at the beginning of the game.
					if (moves.length === 0) {
						// If there are no moves, then this is not a puzzle!
						// Update the view to revert the position.
						// There is no change in state.
						update_view_and_logic(
							this.#chessView,
							this.#setChessLogic,
							state.jgnStudy.rootFEN,
						);
					} else {
						// Do nothing for now.
						// The problem with doing nothing is that the move will be displayed
						const firstMove = moves[0];

						if (firstMove.san === m.san) {
							const replyMove = moves[1];
							if (replyMove) {
								update_view_and_logic(
									this.#chessView,
									this.#setChessLogic,
									replyMove.after,
								);
								state.currentMove = replyMove;
							} else {
								update_view_and_logic(
									this.#chessView,
									this.#setChessLogic,
									firstMove.after,
								);
								state.currentMove = firstMove;
							}
						} else {
							// It's not the correct move
							// There is no current move so we are at the beginning of the game.
							// Additionally, the move made did not match the first so we revert to the root position.
							update_view_and_logic(
								this.#chessView,
								this.#setChessLogic,
								state.jgnStudy.rootFEN,
							);
						}
					}
				}
				break;
			}
			case 'neo': {
				const root = state.neoStudy.root;
				if (state.currentMove) {
					const current_move = get_neo_move_by_id(
						state.neoStudy,
						state.currentMove.moveId,
					);
					const next_move = get_move_next(current_move);
					if (next_move) {
						// There is a following Main Line move.
						if (next_move.san === m.san) {
							const reply_move = get_move_next(next_move);
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
									next_move.after,
								);
								state.currentMove = next_move;
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
						// There is no following Main Line move.
						// The user is trying to move the opponent's piece!
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
							state.neoStudy.rootFEN,
						);
					} else {
						const first_move = first_neo_move(state.neoStudy) as NeoMove;
						if (first_move.san === m.san) {
							const reply_move = get_move_next(first_move);
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
								state.jgnStudy.rootFEN,
							);
						}
					}
				}
				break;
			}
		}
	}
	shapes(state: GameState): DrawShape[] {
		return [];
	}
}
