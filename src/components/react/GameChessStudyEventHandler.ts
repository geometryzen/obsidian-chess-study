import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { deserializePreOrder } from '../../lib/neo/deserializePreOrder.js';
import { ensure_move_is_neo_move_or_variation } from '../../lib/neo/ensure_move_is_neo_move_or_variation.js';
import { first_neo_move } from '../../lib/neo/first_neo_move.js';
import { get_next_move } from '../../lib/neo/get_next_move.js';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id.js';
import { neo_move_from_user_move } from '../../lib/neo/neo_move_from_user_move.js';
import { NeoMove } from '../../lib/neo/NeoMove.js';
import { NeoStudy } from '../../lib/neo/NeoStudy.js';
import { rightmost_neo_node } from '../../lib/neo/rightmost_neo_node.js';
import { serializePreOrder } from '../../lib/neo/serializePreOrder.js';
import { display_relative_move } from '../../lib/ui-state/display_relative_move.js';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position.js';
import { GameState } from './GameState.js';
import { ChessStudyEventHandler } from './ChessStudyEventHandler.js';
import { get_variation_next } from '../../lib/neo/get_variation_next.js';
import { get_target_move } from '../../lib/neo/get_target_move.js';

export class GameChessStudyEventHandler implements ChessStudyEventHandler {
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
		state: Pick<GameState, 'isNotationHidden'>,
		currentMove: NeoMove,
		study: NeoStudy,
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
	gotoNextMove(state: Readonly<GameState>): NeoMove | null {
		if (!this.#chessView) return null;
		// We mutate the state so it cannot be readonly
		return display_relative_move(state, this.#chessView, this.#setChessLogic, {
			offset: 1,
		});
	}
	/**
	 * @override
	 */
	gotoPrevMove(state: Readonly<GameState>): NeoMove | null {
		if (!this.#chessView) return null;
		// Why do we update the currentMove going backwards but not going forwards?
		return display_relative_move(state, this.#chessView, this.#setChessLogic, {
			offset: -1,
		});
	}
	/**
	 * @override
	 */
	gotoMove(state: Readonly<GameState>, moveId: string): NeoMove | null {
		if (!this.#chessView) return null;

		const neoMove: NeoMove = get_neo_move_by_id(state.chessStudy, moveId);
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
	playMove(state: GameState, m: Move): void {
		try {
			if (state.currentChessStudyMove) {
				// Dereference the currentMove. In future we might grab it directly.
				const current_move = get_neo_move_by_id(
					state.chessStudy,
					state.currentChessStudyMove.moveId,
				);
				// console.lg('move', move.san);
				const next_move = get_next_move(current_move);
				if (next_move) {
					// console.lg('next_move', next_move.san);
					let candidate: NeoMove | null = next_move;
					while (candidate) {
						// console.lg('candidate', candidate.san);
						if (candidate.san === m.san) {
							state.currentChessStudyMove = candidate;
							state.currentRepertoireMove = get_target_move(
								state.currentChessStudyMove,
								state.chessStudy,
								state.repertoire,
							);
							return;
						}
						candidate = get_variation_next(candidate);
					}
					// The move will be added as a variation of the next move.
					const parent = rightmost_neo_node(next_move);
					parent.right = neo_move_from_user_move(m, null, null);
					state.currentChessStudyMove = parent.right;
					state.currentRepertoireMove = get_target_move(
						state.currentChessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
				} else {
					// The move will be added as the next Main Line move
					const new_move = neo_move_from_user_move(m, null, null);
					const target = get_neo_move_by_id(
						state.chessStudy,
						state.currentChessStudyMove.moveId,
					);
					target.left = new_move;
					state.currentChessStudyMove = new_move;
					state.currentRepertoireMove = get_target_move(
						state.currentChessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
				}
			} else {
				// console.lg('There is no current move');
				if (state.chessStudy.root === null) {
					// console.lg('The root is null');
					const move = neo_move_from_user_move(m, null, null);
					state.chessStudy.root = move;
					state.currentChessStudyMove = move;
					state.currentRepertoireMove = get_target_move(
						state.currentChessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
				} else {
					// console.lg('The root is defined');
					const first_move = first_neo_move(state.chessStudy) as NeoMove;
					state.currentChessStudyMove = ensure_move_is_neo_move_or_variation(
						m,
						first_move,
					);
					state.currentRepertoireMove = get_target_move(
						state.currentChessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
				}
			}
		} finally {
			if (state.chessStudy.root) {
				// console.lg('serialize and deserialize');
				// This is an aggressive hack to try to demonstrate that useMemo is a problem
				// if we mutate the tree such that a change is not detected.
				const root = deserializePreOrder(serializePreOrder(state.chessStudy.root));
				const study = state.chessStudy;
				state.chessStudy = new NeoStudy(
					study.comment,
					study.shapes,
					study.headers,
					root,
					study.rootFEN,
				);
			}
		}
	}
	/**
	 * @override
	 */
	reset(state: GameState): void {
		// Do nothing
	}
	/**
	 * @override
	 */
	shapes(state: GameState): DrawShape[] {
		if (state.currentChessStudyMove) {
			return state.currentChessStudyMove.shapes;
		} else {
			return state.chessStudy.shapes;
		}
	}
}
