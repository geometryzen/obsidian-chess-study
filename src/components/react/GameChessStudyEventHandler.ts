import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { deserializePreOrder } from '../../lib/neo/deserializePreOrder';
import { ensure_move_is_neo_move_or_variation } from '../../lib/neo/ensure_move_is_neo_move_or_variation';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_next_move } from '../../lib/neo/get_next_move';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { neo_move_from_user_move } from '../../lib/neo/neo_move_from_user_move';
import { NeoMove } from '../../lib/neo/NeoMove';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import { rightmost_neo_node } from '../../lib/neo/rightmost_neo_node';
import { serializePreOrder } from '../../lib/neo/serializePreOrder';
import { display_relative_move } from '../../lib/ui-state/display_relative_move';
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { GameState, MoveToken } from './ChessStudy';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { get_variation_next } from '../../lib/neo/get_variation_next';
import { assert } from 'console';

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
		const position = new ChessJs(neoMove.after);
		this.#setChessLogic(position);
		update_board_view_from_position(this.#chessView, position);
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
			if (state.currentMove) {
				// Dereference the currentMove. In future we might grab it directly.
				const current_move = get_neo_move_by_id(
					state.study,
					state.currentMove.moveId,
				);
				// console.lg('move', move.san);
				const next_move = get_next_move(current_move);
				if (next_move) {
					// console.lg('next_move', next_move.san);
					let candidate: NeoMove | null = next_move;
					while (candidate) {
						// console.lg('candidate', candidate.san);
						assert(candidate.color === m.color, candidate.color, m.color);
						candidate.color;
						m.color;
						if (candidate.san === m.san) {
							state.currentMove = candidate;
							return;
						}
						candidate = get_variation_next(candidate);
					}
					// The move will be added as a variation of the next move.
					const parent = rightmost_neo_node(next_move);
					parent.right = neo_move_from_user_move(m, null, null);
					state.currentMove = parent.right;
				} else {
					// The move will be added as the next Main Line move
					const new_move = neo_move_from_user_move(m, null, null);
					const target = get_neo_move_by_id(state.study, state.currentMove.moveId);
					target.left = new_move;
					state.currentMove = new_move;
				}
			} else {
				// console.lg('There is no current move');
				if (state.study.root === null) {
					// console.lg('The root is null');
					const move = neo_move_from_user_move(m, null, null);
					state.study.root = move;
					state.currentMove = move;
				} else {
					// console.lg('The root is defined');
					const first_move = first_neo_move(state.study) as NeoMove;
					state.currentMove = ensure_move_is_neo_move_or_variation(m, first_move);
				}
			}
		} finally {
			if (state.study.root) {
				// console.lg('serialize and deserialize');
				// This is an aggressive hack to try to demonstrate that useMemo is a problem
				// if we mutate the tree such that a change is not detected.
				const root = deserializePreOrder(serializePreOrder(state.study.root));
				const study = state.study;
				state.study = new NeoStudy(
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
		if (state.currentMove) {
			return state.currentMove.shapes;
		} else {
			return state.study.shapes;
		}
	}
}
