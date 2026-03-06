import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { Draft } from 'immer';
import { GameState, MoveToken } from '../../components/react/ChessStudy';
import { first_jgn_move } from '../jgn/first_jgn_move';
import { get_jgn_move_from_offset } from '../jgn/get_jgn_move_from_offset';
import { JgnMove } from '../jgn/JgnMove';
import { last_jgn_move } from '../jgn/last_jgn_move';
import { first_neo_move } from '../neo/first_neo_move';
import { get_neo_move_from_offset } from '../neo/get_neo_move_from_offset';
import { last_neo_move } from '../neo/last_neo_move';
import { NeoMove } from '../neo/NeoMove';
import { update_view_and_logic } from './update_view_and_logic';

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
				update_view_and_logic(chessView, setChessLogic, moveToDisplay.after);
				return moveToDisplay;
			} else {
				const chess = state.jgnStudy.rootFEN
					? new Chess(state.jgnStudy.rootFEN)
					: new Chess();
				update_view_and_logic(chessView, setChessLogic, chess.fen());
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
				update_view_and_logic(chessView, setChessLogic, nodeToDisplay.after);
				return nodeToDisplay;
			} else {
				const chess = state.neoStudy.rootFEN
					? new Chess(state.neoStudy.rootFEN)
					: new Chess();

				update_view_and_logic(chessView, setChessLogic, chess.fen());
				return null;
			}
		}
	}
};
