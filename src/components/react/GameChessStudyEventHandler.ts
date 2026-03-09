import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { ensure_move_is_jgn_move_or_variation } from '../../lib/jgn/ensure_move_is_jgn_move_or_variation';
import { find_move_index_from_move_id } from '../../lib/jgn/find_move_index_from_move_id';
import { first_jgn_move } from '../../lib/jgn/first_jgn_move';
import { get_jgn_move_by_id } from '../../lib/jgn/get_jgn_move_by_id';
import { jgn_move_from_user_move } from '../../lib/jgn/jgn_move_from_user_move';
import { JgnMove } from '../../lib/jgn/JgnMove';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { is_index_last_in_array } from '../../lib/lang/is_index_last_in_array';
import { deserializePreOrder } from '../../lib/neo/deserializePreOrder';
import { ensure_move_is_neo_move_or_variation } from '../../lib/neo/ensure_move_is_neo_move_or_variation';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { neo_move_from_user_move } from '../../lib/neo/neo_move_from_user_move';
import { NeoMove } from '../../lib/neo/NeoMove';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { serializePreOrder } from '../../lib/neo/serializePreOrder';
import { jgn_from_neo } from '../../lib/transform/jgn_from_neo';
import { neo_from_jgn } from '../../lib/transform/neo_from_jgn';
import { displayRelativeMoveInHistory } from '../../lib/ui-state/display_relative_move';
import { update_view_and_logic } from '../../lib/ui-state/update_view_and_logic';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { rightmost_neo_node } from './rightmost_neo_node';
import { get_move_next } from '../../lib/neo/get_move_next';

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
		neoStudy: NeoStudy,
		jgnStudy: JgnStudy,
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
	gotoNextMove(state: Readonly<GameState>): MoveToken | null {
		if (!this.#chessView) return null;
		// We mutate the state so it cannot be readonly
		return displayRelativeMoveInHistory(
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
	gotoMove(state: Readonly<GameState>, moveId: string): MoveToken | null {
		if (!this.#chessView) return null;

		switch (state.master) {
			case 'neo': {
				const neoMove: NeoMove = get_neo_move_by_id(state.neoStudy, moveId);
				update_view_and_logic(this.#chessView, this.#setChessLogic, neoMove.after);
				return neoMove;
			}
			case 'jgn': {
				const jgnMove: JgnMove = get_jgn_move_by_id(state.jgnStudy, moveId);
				update_view_and_logic(this.#chessView, this.#setChessLogic, jgnMove.after);
				return jgnMove;
			}
		}
	}
	/**
	 * @override
	 *
	 * @param state
	 * @param m The played move that comes from the user.
	 */
	playMove(state: GameState, m: Move): void {
		switch (state.master) {
			case 'jgn': {
				try {
					const moves = state.jgnStudy.moves;
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
								const variantMove = jgn_move_from_user_move(m);
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
								const move = jgn_move_from_user_move(m);
								moves.push(move);

								state.currentMove = move;
							} else {
								// The current move is not the last in the Main Line.
								state.currentMove = ensure_move_is_jgn_move_or_variation(
									m,
									moves[moveIndex + 1],
								);
							}
						}
					} else {
						// This means we are positioned at the beginning of the game.
						// If there are no moves in the game then add it as the first move.
						// If there are moves in the game then
						// TODO: This is probably where we should check the moves and proceed accordingly.
						if (moves.length === 0) {
							const move = jgn_move_from_user_move(m);
							moves.push(move);
							state.currentMove = move;
						} else {
							// There are Main Line moves and yet there is no current move.
							// So we must be positioned before the start of the first move.
							// This is the move to which the played move belongs.
							const first_move = first_jgn_move(state.jgnStudy) as JgnMove;
							state.currentMove = ensure_move_is_jgn_move_or_variation(m, first_move);
						}
					}
				} finally {
					state.neoStudy = neo_from_jgn(state.jgnStudy);
				}
				break;
			}
			case 'neo': {
				try {
					const root = state.neoStudy.root;
					if (state.currentMove) {
						// Dereference the currentMove. In future we might grab it directly.
						const move = get_neo_move_by_id(state.neoStudy, state.currentMove.moveId);
						const next_move = get_move_next(move);
						if (next_move) {
							// There is a following Main Line move.
							if (next_move.san === m.san) {
								state.currentMove = next_move;
								return;
							} else {
								let right = move.right;
								while (right) {
									if (right.san === m.san) {
										state.currentMove = right;
										return;
									}
									right = right.right;
								}
							}
							// The move will be added as a variation of the next move.
							const parent = rightmost_neo_node(next_move);
							parent.right = neo_move_from_user_move(m, null, null);
							state.currentMove = parent.right;
						} else {
							// There is no following Main Line move.
							// Look in the variations.
							let right = move.right;
							while (right) {
								if (right.san === m.san) {
									state.currentMove = right;
									return;
								}
								right = right.right;
							}
							// The move will be added as the next Main Line move
							const new_move = neo_move_from_user_move(m, null, null);
							const target = get_neo_move_by_id(
								state.neoStudy,
								state.currentMove.moveId,
							);
							target.left = new_move;
							state.currentMove = new_move;
						}
					} else {
						if (root === null) {
							const move = neo_move_from_user_move(m, null, null);
							state.neoStudy.root = move;
							state.currentMove = move;
						} else {
							const first_move = first_neo_move(state.neoStudy) as NeoMove;
							state.currentMove = ensure_move_is_neo_move_or_variation(m, first_move);
						}
					}
				} finally {
					if (state.neoStudy.root) {
						console.log('serialize and deserialize');
						// This is an aggressive hack to try to demonstrate that useMemo is a problem
						// if we mutate the tree such that a change is not detected.
						const root = deserializePreOrder(serializePreOrder(state.neoStudy.root));
						const study = state.neoStudy;
						state.neoStudy = new NeoStudy(
							study.comment,
							study.headers,
							root,
							study.rootFEN,
						);
					}
					state.jgnStudy = jgn_from_neo(state.neoStudy);
				}
				break;
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
