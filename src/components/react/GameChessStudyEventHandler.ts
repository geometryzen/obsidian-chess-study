import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { nanoid } from 'nanoid';
import { ChessStudyFileContent, ChessStudyMove } from 'src/lib/storage';
import {
	displayRelativeMoveInHistory,
	getMoveById,
	updateView,
} from 'src/lib/ui-state';
import { find_variation_index_with_first_move } from 'src/lib/ui-state/find_variation_index_with_first_move';
import { find_move_index_from_move_id } from '../../lib/ui-state/find_move_index_from_move_id';
import { GameCurrentMove, GameState } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';

export class GameChessStudyEventHandler implements ChessStudyEventHandler {
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
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: GameCurrentMove,
		study: ChessStudyFileContent,
	): void {
		state.isNotationHidden = false;
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
	gotoNextMove(state: GameState): void {
		if (!this.#chessView) return;

		state.currentMove = displayRelativeMoveInHistory(
			state,
			this.#chessView,
			this.#setChessLogic,
			{
				offset: 1,
				selectedMoveId: null,
			},
		);
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: GameState): void {
		if (!this.#chessView) return;

		state.currentMove = displayRelativeMoveInHistory(
			state,
			this.#chessView,
			this.#setChessLogic,
			{
				offset: -1,
				selectedMoveId: null,
			},
		);
	}
	/**
	 * @override
	 */
	gotoMove(state: GameState, moveId: string): void {
		if (!this.#chessView) return;
		const move = getMoveById(state.study.moves, moveId);
		updateView(this.#chessView, this.#setChessLogic, move.after);
		state.currentMove = move;
	}
	/**
	 * @override
	 *
	 * @param state
	 * @param m This move comes from the
	 * @returns
	 */
	playMove(state: GameState, m: Move): void {
		const moves = state.study.moves;

		if (state.currentMove) {
			const currentMoveId = state.currentMove.moveId;

			const { indexLocation, moveIndex } = find_move_index_from_move_id(
				moves,
				currentMoveId,
			);

			if (indexLocation) {
				// The current move belongs to a variation (not the Main Line).
				const parent: ChessStudyMove = moves[indexLocation.mainLineMoveIndex];
				const variantMoves = parent.variants[indexLocation.variationIndex].moves;

				const isLastMove = moveIndex === variantMoves.length - 1;

				// Only push if its the last move in the variant because depth can only be 1
				if (isLastMove) {
					const variantMove: ChessStudyMove = {
						moveId: nanoid(),
						variants: [],
						shapes: [],
						comment: null,
						color: m.color,
						san: m.san,
						after: m.after,
						from: m.from,
						to: m.to,
						promotion: m.promotion,
						nags: [],
					};
					variantMoves.push(variantMove);

					const tempChess = new ChessModel(m.after);

					state.currentMove = variantMove;

					this.#chessView?.set({
						fen: m.after,
						check: tempChess.isCheck(),
					});
				} else {
					// We should provide some notice?
					// We also must revert the board.
					// Easier may be simply to allow variations of variaton.
				}
			} else {
				// The current move belongs to the Main Line.
				const currentMoveIndex = moves.findIndex(
					(move: ChessStudyMove) => move.moveId === currentMoveId,
				);
				const isCurrentMoveLast = currentMoveIndex === moves.length - 1;
				if (isCurrentMoveLast) {
					// If the current move is the last move then the played move
					// should be added as a new Main Line move.
					const move: ChessStudyMove = {
						moveId: nanoid(),
						variants: [],
						shapes: [],
						comment: null,
						color: m.color,
						san: m.san,
						after: m.after,
						from: m.from,
						to: m.to,
						promotion: m.promotion,
						nags: [],
					};
					moves.push(move);

					state.currentMove = move;
				} else {
					// The current move is not the last in the Main Line.
					const currentMove = moves[moveIndex];

					// check if the next move is the same move
					const nextMove = moves[moveIndex + 1];

					if (nextMove.san === m.san) {
						state.currentMove = nextMove;
						return;
					} else {
						// The played move is not the same as the next Main Line move.
						// If a variation exists that starts with the playedMove, then go into that variation.
						// Otherwise, create a new variation with the played move as the first move
						const variationIndex = find_variation_index_with_first_move(
							currentMove.variants,
							m.san,
						);
						if (variationIndex !== -1) {
							// We must set the state.currentMove to that move
							state.currentMove = currentMove.variants[variationIndex].moves[0];
						} else {
							// The move does not exist in any existing variation so we create a new variation
							const move: ChessStudyMove = {
								moveId: nanoid(),
								variants: [],
								shapes: [],
								comment: null,
								color: m.color,
								san: m.san,
								after: m.after,
								from: m.from,
								to: m.to,
								promotion: m.promotion,
								nags: [],
							};

							currentMove.variants.push({
								parentMoveId: currentMove.moveId,
								variantId: nanoid(),
								moves: [move],
							});

							state.currentMove = move;
						}
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
				const move: ChessStudyMove = {
					moveId: nanoid(),
					variants: [],
					shapes: [],
					comment: null,
					promotion: m.promotion,
					nags: [],
					color: m.color,
					san: m.san,
					after: m.after,
					from: m.from,
					to: m.to,
				};
				moves.push(move);

				state.currentMove = move;
			} else {
				// Do nothing for now.
				// The problem with doing nothing is that the move will be displayed
				const firstMove = moves[0];

				if (firstMove.san === m.san) {
					state.currentMove = firstMove;
				} else {
					// What do we do if the moves do not match?
					// I think it becomes a Variation.
				}
			}
		}
	}
}
