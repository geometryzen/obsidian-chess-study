import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { Draft } from 'immer';
import { GameState, MoveToken } from '../../components/react/ChessStudy';
import { legal_moves } from '../chess-logic/legal_moves';
import { turn_color_white_or_black } from '../chess-logic/turn_color_white_or_black';
import { JgnMove } from '../jgn/JgnMove';
import { find_move_index_from_move_id } from './find_move_index_from_move_id';
import { get_move_from_offset } from './get_move_from_offset';

export const getMoveById = (moves: JgnMove[], moveId: string) => {
	const { indexLocation: variant, moveIndex } = find_move_index_from_move_id(
		moves,
		moveId,
	);
	// Are we in a variant? Are we not? Decide which move to display

	if (variant) {
		const variantMoves =
			moves[variant.mainLineMoveIndex].variants[variant.variationIndex].moves;

		if (typeof variantMoves[moveIndex] !== 'undefined') {
			return variantMoves[moveIndex];
		}

		return moves[variant.mainLineMoveIndex];
	}
	return moves[moveIndex];
};

/**
 * TODO: refactor the function so
 * @param state
 * @param chessView
 * @param setChessLogic
 * @param options
 * @returns
 */
export const displayRelativeMoveInHistory = (
	state: Readonly<Draft<GameState>>,
	chessView: ChessgroundApi,
	setChessLogic: React.Dispatch<React.SetStateAction<Chess>>,
	options: { offset: 1 | -1; selectedMoveId: string | null },
): MoveToken | null => {
	let moveToDisplay: Pick<
		JgnMove,
		'moveId' | 'comment' | 'shapes' | 'after'
	> | null = null;

	const { offset, selectedMoveId } = options;

	// Figure out where we are
	const currentMove = state.currentMove;

	if (currentMove) {
		const currentMoveId = currentMove.moveId;

		// If we pass a moveId, find out where that is and offset from there, otherwise take current moveId
		const baseMoveId = selectedMoveId || currentMoveId;

		moveToDisplay = get_move_from_offset(
			state.jgnStudy.moves,
			baseMoveId,
			offset,
		);
	} else {
		if (offset < 0) {
			moveToDisplay = state.jgnStudy.moves[state.jgnStudy.moves.length - 1];
		} else {
			// An offset of +1 always means that the user wants to go "Forward".
			// There will be no selected move.
			moveToDisplay = state.jgnStudy.moves[0];
		}
	}

	if (moveToDisplay) {
		updateView(chessView, setChessLogic, moveToDisplay.after);
		return moveToDisplay;
	} else {
		const chess = state.jgnStudy.rootFEN
			? new Chess(state.jgnStudy.rootFEN)
			: new Chess();
		updateView(chessView, setChessLogic, chess.fen());
		return null;
	}
};

/**
 *
 * @param chessView
 * @param setChessLogic
 * @param fen
 */
export const updateView = (
	chessView: ChessgroundApi,
	setChessLogic: React.Dispatch<React.SetStateAction<Chess>>,
	fen: string,
): void => {
	const chess = new Chess(fen);

	chessView.set({
		fen,
		check: chess.isCheck(),
		movable: {
			free: false,
			color: turn_color_white_or_black(chess),
			dests: legal_moves(chess),
		},
		turnColor: turn_color_white_or_black(chess),
	});

	setChessLogic(chess);
};

export function getCurrentMove(state: Draft<GameState>): Draft<JgnMove> | null {
	const currentMoveId = state.currentMove?.moveId;
	const moves = state.jgnStudy.moves;

	if (currentMoveId) {
		const { indexLocation: variant, moveIndex } = find_move_index_from_move_id(
			moves,
			currentMoveId,
		);

		if (variant) {
			return moves[variant.mainLineMoveIndex].variants[variant.variationIndex]
				.moves[moveIndex];
		} else {
			return moves[moveIndex];
		}
	}

	return null;
}
