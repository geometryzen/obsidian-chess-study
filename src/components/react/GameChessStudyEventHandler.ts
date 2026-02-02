import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { nanoid } from 'nanoid';
import { ChessStudyMove } from 'src/lib/storage';
import {
	displayRelativeMoveInHistory,
	findMoveIndex,
	getMoveById,
	updateView,
} from 'src/lib/ui-state';
import { GameState } from './ChessStudy';
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
	setInitialState(state: Pick<GameState, 'isNotationHidden'>): void {
		state.isNotationHidden = false;
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
	 */
	playMove(state: GameState, m: Move): void {
		const moves = state.study.moves;

		if (state.currentMove) {
			const currentMoveId = state.currentMove.moveId;
			const currentMoveIndex = moves.findIndex(
				(move) => move.moveId === currentMoveId,
			);

			const { variant, moveIndex } = findMoveIndex(moves, currentMoveId);

			if (variant) {
				// handle Variation
				const parent = moves[variant.parentMoveIndex];
				const variantMoves = parent.variants[variant.variantIndex].moves;

				const isLastMove = moveIndex === variantMoves.length - 1;

				// Only push if its the last move in the variant because depth can only be 1
				if (isLastMove) {
					const variantMove: ChessStudyMove = {
						...m,
						moveId: nanoid(),
						variants: [],
						shapes: [],
						comment: null,
						isCapture: () => false,
						isPromotion: () => false,
						isEnPassant: () => false,
						isKingsideCastle: () => false,
						isQueensideCastle: () => false,
						isBigPawn: () => false,
						isNullMove: () => false,
					};
					variantMoves.push(variantMove);

					const tempChess = new ChessModel(m.after);

					state.currentMove = variantMove;

					this.#chessView?.set({
						fen: m.after,
						check: tempChess.isCheck(),
					});
				}
			} else {
				// TODO: It would be nice for the different kinds to be handled by different instances of some interface.
				/*
							switch(config.chessStudyKind) {
								case 'game':
								case 'legacy':
								case 'position': {
									break;
								}
								case 'puzzle': {
									break;
								}
							}
							*/
				// handle Main Line
				const isLastMove = currentMoveIndex === moves.length - 1;

				if (isLastMove) {
					const move: ChessStudyMove = {
						...m,
						moveId: nanoid(),
						variants: [],
						shapes: [],
						comment: null,
						isCapture: () => false,
						isPromotion: () => false,
						isEnPassant: () => false,
						isKingsideCastle: () => false,
						isQueensideCastle: () => false,
						isBigPawn: () => false,
						isNullMove: () => false,
					};
					moves.push(move);

					state.currentMove = move;
				} else {
					const currentMove = moves[moveIndex];

					// check if the next move is the same move
					const nextMove = moves[moveIndex + 1];

					if (nextMove.san === m.san) {
						state.currentMove = nextMove;
						return;
					} else {
						const move: ChessStudyMove = {
							...m,
							moveId: nanoid(),
							variants: [],
							shapes: [],
							comment: null,
							isCapture: () => false,
							isPromotion: () => false,
							isEnPassant: () => false,
							isKingsideCastle: () => false,
							isQueensideCastle: () => false,
							isBigPawn: () => false,
							isNullMove: () => false,
						};

						currentMove.variants.push({
							parentMoveId: currentMove.moveId,
							variantId: nanoid(),
							moves: [move],
						});

						state.currentMove = move;
					}

					const move: ChessStudyMove = {
						...m,
						moveId: nanoid(),
						variants: [],
						shapes: [],
						comment: null,
						isCapture: () => false,
						isPromotion: () => false,
						isEnPassant: () => false,
						isKingsideCastle: () => false,
						isQueensideCastle: () => false,
						isBigPawn: () => false,
						isNullMove: () => false,
					};

					currentMove.variants.push({
						parentMoveId: currentMove.moveId,
						variantId: nanoid(),
						moves: [move],
					});

					state.currentMove = move;
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
					...m,
					moveId: nanoid(),
					variants: [],
					shapes: [],
					comment: null,
					isCapture: () => false,
					isPromotion: () => false,
					isEnPassant: () => false,
					isKingsideCastle: () => false,
					isQueensideCastle: () => false,
					isBigPawn: () => false,
					isNullMove: () => false,
				};
				moves.push(move);

				state.currentMove = move;
			} else {
				// Do nothing for now.
				// The problem with doing nothing is that the move will be displayed
				const firstMove = moves[0];

				if (firstMove.san === m.san) {
					state.currentMove = firstMove;
					return;
				} else {
					// What do we do if the moves do not match?
					// I think it becomes a Variation.
				}
			}
		}
	}
}
