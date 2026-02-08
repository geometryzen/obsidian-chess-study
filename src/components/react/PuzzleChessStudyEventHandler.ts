import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { updateView } from 'src/lib/ui-state';
import { find_move_index_from_move_id } from '../../lib/ui-state/find_move_index_from_move_id';
import { GameState } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';

export class PuzzleChessStudyEventHandler implements ChessStudyEventHandler {
	readonly #chessView: ChessView | null;
	readonly #setChessLogic: React.Dispatch<React.SetStateAction<ChessModel>>;
	constructor(
		chessView: ChessView | null,
		setChessLogic: React.Dispatch<React.SetStateAction<ChessModel>>,
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
	playMove(state: GameState, m: Move): void {
		if (!this.#chessView) return;

		const moves = state.study.moves;

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
				const isLastMove = currentMoveIndex === moves.length - 1;

				if (isLastMove) {
					// The user is trying to move the opponent's piece!
					updateView(this.#chessView, this.#setChessLogic, moves[moveIndex].after);
				} else {
					// check if the next move is the same move
					const nextMove = moves[moveIndex + 1];

					if (nextMove.san === m.san) {
						const replyMove = moves[moveIndex + 2];
						if (replyMove) {
							updateView(this.#chessView, this.#setChessLogic, replyMove.after);
							state.currentMove = replyMove;
						} else {
							updateView(this.#chessView, this.#setChessLogic, nextMove.after);
							state.currentMove = nextMove;
							state.isNotationHidden = false;
						}
					} else {
						// There is a current move.
						// A move was made that did not match the puzzle.
						// Revert to the position after the current move.
						updateView(this.#chessView, this.#setChessLogic, moves[moveIndex].after);
					}
				}
			}
		} else {
			// There is no current move.
			// This means we are positioned at the beginning of the game.
			// If there are no moves in the game then add it as the first move.
			// If there are moves in the game then
			// TODO: This is probably where we should check the moves and proceed accordingly.
			if (moves.length === 0) {
				// If there are no moves, then this is not a puzzle!
				// Update the view to revert the position.
				// There is no change in state.
				updateView(this.#chessView, this.#setChessLogic, state.study.rootFEN);
				// state.currentMove = move;
			} else {
				// Do nothing for now.
				// The problem with doing nothing is that the move will be displayed
				const firstMove = moves[0];

				if (firstMove.san === m.san) {
					const replyMove = moves[1];
					if (replyMove) {
						updateView(this.#chessView, this.#setChessLogic, replyMove.after);
						state.currentMove = replyMove;
					} else {
						updateView(this.#chessView, this.#setChessLogic, firstMove.after);
						state.currentMove = firstMove;
					}
				} else {
					// It's not the correct move
					// There is no current move so we are at the beginning of the game.
					// Additionally, the move made did not match the first so we revert to the root position.
					updateView(this.#chessView, this.#setChessLogic, state.study.rootFEN);
				}
			}
		}
	}
}
