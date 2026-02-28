import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { is_index_last_in_array } from '../../lib/lang/is_index_last_in_array';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { JgnMove } from '../../lib/jgn/JgnMove';
import { NeoStudy } from '../../lib/tree/NeoStudy';
import {
	displayRelativeMoveInHistory,
	getMoveById,
	updateView,
} from '../../lib/ui-state';
import { find_move_index_from_move_id } from '../../lib/ui-state/find_move_index_from_move_id';
import { chess_study_move_from_user_move } from './chess_study_move_from_user_move';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { ensure_move_in_scope } from './ensure_move_in_owner';

export class GameChessStudyEventHandler implements ChessStudyEventHandler {
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
	setInitialState(
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: MoveToken,
		model: NeoStudy,
		study: JgnStudy,
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
	 * @param m The played move that comes from the user.
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
				const mainLineMove: JgnMove = moves[indexLocation.mainLineMoveIndex];
				const variantMoves =
					mainLineMove.variants[indexLocation.variationIndex].moves;

				const isLastMove = moveIndex === variantMoves.length - 1;

				// Only push if its the last move in the variant because depth can only be 1
				if (isLastMove) {
					const variantMove = chess_study_move_from_user_move(m);
					variantMoves.push(variantMove);

					const tempChess = new ChessJs(m.after);

					state.currentMove = variantMove;

					this.#chessView?.set({
						fen: m.after,
						check: tempChess.isCheck(),
					});
				} else {
					/*
					const vml = find_move_index_from_move_id(variantMoves, state.currentMove.moveId)
					if (is_index_last_in_array(vml.moveIndex, variantMoves)) {
						// If the current move is the last move then the played move
						// should be added as a Main Line move.
						const move = chess_study_move_from_user_move(m);
						variantMoves.push(move);

						state.currentMove = move;
					} else {
						// The current move is not the last in the Main Line.
						state.currentMove = ensure_move_in_scope(m, variantMoves[vml.moveIndex + 1]);
					}
					*/
				}
			} else {
				// The current move belongs to the Main Line.
				if (is_index_last_in_array(moveIndex, moves)) {
					// If the current move is the last move then the played move
					// should be added as a Main Line move.
					const move = chess_study_move_from_user_move(m);
					moves.push(move);

					state.currentMove = move;
				} else {
					// The current move is not the last in the Main Line.
					state.currentMove = ensure_move_in_scope(m, moves[moveIndex + 1]);
				}
			}
		} else {
			// This means we are positioned at the beginning of the game.
			// If there are no moves in the game then add it as the first move.
			// If there are moves in the game then
			// TODO: This is probably where we should check the moves and proceed accordingly.
			if (moves.length === 0) {
				const move = chess_study_move_from_user_move(m);
				moves.push(move);
				state.currentMove = move;
			} else {
				// There are Main Line moves and yet there is no curent move.
				// So we must be positioned before the start of the first move.
				// This is the move to which the played move belongs.
				state.currentMove = ensure_move_in_scope(m, moves[0]);
			}
		}
	}
	/**
	 * @override
	 */
	shapes(state: GameState): DrawShape[] {
		return state.currentMove?.shapes || [];
	}
}
