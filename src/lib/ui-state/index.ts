import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { Draft } from 'immer';
import { GameState, MoveToken } from '../../components/react/ChessStudy';
import { legal_moves } from '../chess-logic/legal_moves';
import { turn_color_white_or_black } from '../chess-logic/turn_color_white_or_black';
import { find_move_index_from_move_id } from '../jgn/find_move_index_from_move_id';
import { first_jgn_move } from '../jgn/first_jgn_move';
import { get_jgn_move_from_offset } from '../jgn/get_jgn_move_from_offset';
import { JgnMove } from '../jgn/JgnMove';
import { last_jgn_move } from '../jgn/last_jgn_move';
import { first_neo_move } from '../neo/first_neo_move';
import { get_neo_move_from_offset } from '../neo/get_neo_move_from_offset';
import { last_neo_move } from '../neo/last_neo_move';
import { NeoMove } from '../neo/NeoMove';

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
	switch (state.master) {
		case 'jgn': {
			let moveToDisplay: JgnMove | null = null;

			const { offset, selectedMoveId } = options;

			// Figure out where we are
			const currentMove = state.currentMove;

			if (currentMove) {
				const currentMoveId = currentMove.moveId;

				// If we pass a moveId, find out where that is and offset from there, otherwise take current moveId
				const baseMoveId = selectedMoveId || currentMoveId;

				moveToDisplay = get_jgn_move_from_offset(
					state.jgnStudy,
					baseMoveId,
					offset,
				);
			} else {
				if (offset < 0) {
					moveToDisplay = last_jgn_move(state.jgnStudy);
				} else {
					// An offset of +1 always means that the user wants to go "Forward".
					// There will be no selected move.
					moveToDisplay = first_jgn_move(state.jgnStudy);
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
			break;
		}
		case 'neo': {
			let nodeToDisplay: NeoMove | null = null;

			const { offset, selectedMoveId } = options;

			// Figure out where we are
			const currentMove = state.currentMove;

			if (currentMove) {
				const currentMoveId = currentMove.moveId;

				// If we pass a moveId, find out where that is and offset from there, otherwise take current moveId
				const baseMoveId = selectedMoveId || currentMoveId;

				nodeToDisplay = get_neo_move_from_offset(
					state.neoStudy,
					baseMoveId,
					offset,
				);
			} else {
				if (offset < 0) {
					nodeToDisplay = last_neo_move(state.neoStudy);
				} else {
					// An offset of +1 always means that the user wants to go "Forward".
					// There will be no selected move.
					nodeToDisplay = first_neo_move(state.neoStudy);
				}
			}

			if (nodeToDisplay) {
				updateView(chessView, setChessLogic, nodeToDisplay.after);
				return nodeToDisplay;
			} else {
				const chess = state.neoStudy.rootFEN
					? new Chess(state.neoStudy.rootFEN)
					: new Chess();

				updateView(chessView, setChessLogic, chess.fen());
				return null;
			}
		}
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
