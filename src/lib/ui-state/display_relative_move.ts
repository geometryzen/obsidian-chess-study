import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { GameState, MoveToken } from '../../components/react/ChessStudy';
import { first_neo_move } from '../neo/first_neo_move';
import { get_neo_move_from_offset } from '../neo/get_neo_move_from_offset';
import { last_neo_move } from '../neo/last_neo_move';
import { NeoMove } from '../neo/NeoMove';
import { update_view_and_logic } from './update_view_and_logic';

/**
 * @param state
 * @param chessView
 * @param setChessLogic
 * @param options
 * @returns
 */
export function display_relative_move(
	state: Readonly<GameState>,
	chessView: ChessgroundApi,
	setChessLogic: React.Dispatch<React.SetStateAction<Chess>>,
	options: { offset: 1 | -1 },
): MoveToken | null {
	let nodeToDisplay: NeoMove | null = null;

	const { offset } = options;

	// Figure out where we are
	const currentMove = state.currentMove;

	if (currentMove) {
		nodeToDisplay = get_neo_move_from_offset(
			state.study,
			currentMove.moveId,
			offset,
		);
	} else {
		if (offset < 0) {
			// If we are going backwards
			nodeToDisplay = last_neo_move(state.study);
		} else {
			// An offset of +1 always means that the user wants to go "Forward".
			// There will be no selected move.
			nodeToDisplay = first_neo_move(state.study);
		}
	}

	if (nodeToDisplay) {
		update_view_and_logic(chessView, setChessLogic, nodeToDisplay.after);
		return nodeToDisplay;
	} else {
		const chess = state.study.rootFEN
			? new Chess(state.study.rootFEN)
			: new Chess();

		update_view_and_logic(chessView, setChessLogic, chess.fen());
		return null;
	}
}
