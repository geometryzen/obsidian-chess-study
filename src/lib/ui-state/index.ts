import { Chess } from 'chess.js';
import { Api as ChessgroundApi } from 'chessground/api';
import { Draft } from 'immer';
import { GameCurrentMove, GameState } from 'src/components/react/ChessStudy';
import { legalMoves } from '../chess-logic';
import { ChessStudyMove, VariantMove } from '../storage';
import { turnColor } from '../chess-logic/turnColor';

interface MovePosition {
	variant: { parentMoveIndex: number; variantIndex: number } | null;
	moveIndex: number;
}

export const findMoveIndex = (
	moves: ChessStudyMove[],
	moveId: string,
): MovePosition => {
	for (const [iMainLine, move] of moves.entries()) {
		if (move.moveId === moveId) return { variant: null, moveIndex: iMainLine };

		for (const [iVariant, variant] of move.variants.entries()) {
			const moveIndex = variant.moves.findIndex((move) => move.moveId === moveId);

			if (moveIndex >= 0)
				return {
					variant: { parentMoveIndex: iMainLine, variantIndex: iVariant },
					moveIndex: moveIndex,
				};
		}
	}

	return { variant: null, moveIndex: -1 };
};

const getMoveToDisplay = (
	moves: ChessStudyMove[],
	moveId: string,
	offset: number,
) => {
	let moveToDisplay: ChessStudyMove | VariantMove | null = null;
	const { variant, moveIndex } = findMoveIndex(moves, moveId);
	// Are we in a variant? Are we not? Decide which move to display

	if (variant) {
		const variantMoves =
			moves[variant.parentMoveIndex].variants[variant.variantIndex].moves;

		if (typeof variantMoves[moveIndex + offset] !== 'undefined') {
			return variantMoves[moveIndex + offset];
		}

		if (typeof moveToDisplay === 'undefined') {
			moveToDisplay = moves[variant.parentMoveIndex + offset];
		}
	} else {
		if (typeof moves[moveIndex + offset] !== 'undefined') {
			moveToDisplay = moves[moveIndex + offset];
		}
	}
	return moveToDisplay;
};

export const getMoveById = (moves: ChessStudyMove[], moveId: string) => {
	const { variant, moveIndex } = findMoveIndex(moves, moveId);
	// Are we in a variant? Are we not? Decide which move to display

	if (variant) {
		const variantMoves =
			moves[variant.parentMoveIndex].variants[variant.variantIndex].moves;

		if (typeof variantMoves[moveIndex] !== 'undefined') {
			return variantMoves[moveIndex];
		}

		return moves[variant.parentMoveIndex];
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
): GameCurrentMove => {
	let moveToDisplay: Pick<
		VariantMove,
		'moveId' | 'comment' | 'shapes' | 'after'
	> | null = null;

	const { offset, selectedMoveId } = options;
	console.log('displayMoveInHistory');
	console.log('offset', offset);
	console.log('selectedMoveId', selectedMoveId);

	// Figure out where we are
	const currentMove = state.currentMove;

	if (currentMove) {
		const currentMoveId = currentMove.moveId;
		console.log('currMoveId', currentMoveId);

		// If we pass a moveId, find out where that is and offset from there, otherwise take current moveId
		const baseMoveId = selectedMoveId || currentMoveId;
		console.log('baseMoveId', baseMoveId);

		moveToDisplay = getMoveToDisplay(state.study.moves, baseMoveId, offset);
	} else {
		console.log('currentMove', currentMove);
		if (offset < 0) {
			moveToDisplay = state.study.moves[state.study.moves.length - 1];
		} else {
			// An offset of +1 always means that the user wants to go "Forward".
			// There will be no selected move.
			moveToDisplay = state.study.moves[0];
		}
	}

	if (moveToDisplay) {
		updateView(chessView, setChessLogic, moveToDisplay.after);
		return moveToDisplay;
	} else {
		const chess = state.study.rootFEN
			? new Chess(state.study.rootFEN)
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
			color: turnColor(chess),
			dests: legalMoves(chess),
		},
		turnColor: turnColor(chess),
	});

	setChessLogic(chess);
};

export const getCurrentMove = (
	draft: Draft<GameState>,
): Draft<ChessStudyMove> | Draft<VariantMove> | null => {
	const currentMoveId = draft.currentMove?.moveId;
	const moves = draft.study.moves;

	if (currentMoveId) {
		const { variant, moveIndex } = findMoveIndex(moves, currentMoveId);

		if (variant) {
			return moves[variant.parentMoveIndex].variants[variant.variantIndex].moves[
				moveIndex
			];
		} else {
			return moves[moveIndex];
		}
	}

	return null;
};
