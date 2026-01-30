import { JSONContent } from '@tiptap/react';
import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { App, Notice } from 'obsidian';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ChessStudyPluginSettings } from 'src/components/obsidian/ChessStudyPluginSettingsTab';
import { parseUserConfig } from 'src/lib/obsidian';
import {
	ChessStudyDataAdapter,
	ChessStudyFileData,
	ChessStudyMove,
	VariantMove,
} from 'src/lib/storage';
import {
	displayRelativeMoveInHistory,
	findMoveIndex,
	getCurrentMove,
	getMoveById,
	displayMove,
} from 'src/lib/ui-state';
import { useImmerReducer } from 'use-immer';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { CommentSection } from './CommentSection';
import { PgnViewer } from './PgnViewer';

export type ChessStudyConfig = ChessgroundProps;

interface AppProps {
	source: string;
	app: App;
	pluginSettings: ChessStudyPluginSettings;
	chessStudyData: ChessStudyFileData;
	dataAdapter: ChessStudyDataAdapter;
}

export interface GameState {
	currentMove: ChessStudyMove | VariantMove | null;
	isViewOnly: boolean;
	study: ChessStudyFileData;
}

export type GameActions =
	| { type: 'ADD_MOVE_TO_HISTORY'; move: Move }
	| { type: 'REMOVE_LAST_MOVE_FROM_HISTORY' }
	| { type: 'DISPLAY_NEXT_MOVE_IN_HISTORY' }
	| { type: 'DISPLAY_PREVIOUS_MOVE_IN_HISTORY' }
	| { type: 'DISPLAY_SELECTED_MOVE_IN_HISTORY'; moveId: string }
	| { type: 'SYNC_SHAPES'; shapes: DrawShape[] }
	| { type: 'SYNC_COMMENT'; comment: JSONContent | null };

/**
 * This is the top-level React component in our Markdown renderer.
 * @param param0
 * @returns
 */
export const ChessStudy = ({
	source,
	pluginSettings,
	chessStudyData,
	dataAdapter,
}: AppProps) => {
	// Parse Obsidian / Code Block Settings
	const {
		boardColor,
		boardOrientation,
		disableNavigation,
		readOnly,
		viewComments,
		chessStudyId,
	} = parseUserConfig(pluginSettings, source);

	// Setup Chessground API
	const [chessView, setChessView] = useState<ChessView | null>(null);

	// Setup Chess.js API
	const [initialChessLogic, firstPlayer, initialMoveNumber] = useMemo(() => {
		const chess = new ChessModel(chessStudyData.rootFEN);

		const firstPlayer = chess.turn();
		const initialMoveNumber = chess.moveNumber();

		chessStudyData.moves.forEach((move) => {
			chess.move({
				from: move.from,
				to: move.to,
				promotion: move.promotion,
			});
		});

		return [chess, firstPlayer, initialMoveNumber];
	}, [chessStudyData.moves, chessStudyData.rootFEN]);

	const [chessLogic, setChessLogic] = useState(initialChessLogic);

	// Why are we using use-immer instead of React's useReducer hook?
	// The purpose is to have immutable state and the immer librray helps with the handling.
	// This may be more efficient than using mutable state?
	const [gameState, dispatch] = useImmerReducer<GameState, GameActions>(
		// The first argument is the reducer function
		(state, action) => {
			const hasNoMoves = state.study.moves.length === 0;
			switch (action.type) {
				case 'DISPLAY_NEXT_MOVE_IN_HISTORY': {
					if (!chessView || hasNoMoves) return state;

					displayRelativeMoveInHistory(state, chessView, setChessLogic, {
						offset: 1,
						selectedMoveId: null,
					});

					return state;
				}
				case 'DISPLAY_PREVIOUS_MOVE_IN_HISTORY': {
					if (!chessView || hasNoMoves) return state;

					displayRelativeMoveInHistory(state, chessView, setChessLogic, {
						offset: -1,
						selectedMoveId: null,
					});

					return state;
				}
				case 'REMOVE_LAST_MOVE_FROM_HISTORY': {
					if (!chessView || hasNoMoves) return state;

					const moves = state.study.moves;

					const currentMoveId = state.currentMove?.moveId;

					if (currentMoveId) {
						const { variant, moveIndex } = findMoveIndex(moves, currentMoveId);

						if (variant) {
							const parent = moves[variant.parentMoveIndex];
							const variantMoves = parent.variants[variant.variantIndex].moves;

							const isLastMove = moveIndex === variantMoves.length - 1;

							if (isLastMove) {
								displayRelativeMoveInHistory(state, chessView, setChessLogic, {
									offset: -1,
									selectedMoveId: currentMoveId,
								});
							}

							variantMoves.pop();
							if (variantMoves.length === 0) {
								parent.variants.splice(variant.variantIndex, 1);
							}

							if (isLastMove) {
								state.currentMove =
									variantMoves.length > 0
										? variantMoves[variantMoves.length - 1]
										: moves[variant.parentMoveIndex];
							}
						} else {
							const isLastMove = moveIndex === moves.length - 1;

							if (isLastMove) {
								displayRelativeMoveInHistory(state, chessView, setChessLogic, {
									offset: -1,
									selectedMoveId: currentMoveId,
								});
							}

							moves.pop();

							if (isLastMove) {
								state.currentMove = moves.length > 0 ? moves[moves.length - 1] : null;
							}
						}
					}

					return state;
				}
				case 'DISPLAY_SELECTED_MOVE_IN_HISTORY': {
					if (!chessView || hasNoMoves) return state;

					const move = getMoveById(state.study.moves, action.moveId);
					displayMove(chessView, setChessLogic, move);
					state.currentMove = move;
					return state;
				}
				case 'SYNC_SHAPES': {
					if (!chessView || hasNoMoves) return state;

					const move = getCurrentMove(state);

					if (move) {
						move.shapes = action.shapes;
						state.currentMove = move;
					}

					return state;
				}
				case 'SYNC_COMMENT': {
					if (!chessView || hasNoMoves) return state;

					const move = getCurrentMove(state);

					if (move) {
						move.comment = action.comment;
						state.currentMove = move;
					}

					return state;
				}
				case 'ADD_MOVE_TO_HISTORY': {
					// There seems to be a bug whereby if you hit the Back button to get positioned
					// just before the first move, then making the first move adds it to the move list as if it were a new move.
					const newMove = action.move;

					const moves = state.study.moves;
					const currentMoveId = state.currentMove?.moveId;
					console.log('currentMove', state.currentMove);
					console.log('currentMoveId', currentMoveId);

					const moveId = nanoid();

					if (currentMoveId) {
						const currentMoveIndex = moves.findIndex(
							(move) => move.moveId === currentMoveId,
						);

						const { variant, moveIndex } = findMoveIndex(moves, currentMoveId);

						if (variant) {
							//handle variant
							const parent = moves[variant.parentMoveIndex];
							const variantMoves = parent.variants[variant.variantIndex].moves;

							const isLastMove = moveIndex === variantMoves.length - 1;

							//Only push if its the last move in the variant because depth can only be 1
							if (isLastMove) {
								const move: ChessStudyMove = {
									...newMove,
									moveId: moveId,
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
								variantMoves.push(move);

								const tempChess = new ChessModel(newMove.after);

								state.currentMove = move;

								chessView?.set({
									fen: newMove.after,
									check: tempChess.isCheck(),
								});
							}
						} else {
							// handle main line
							const isLastMove = currentMoveIndex === moves.length - 1;

							if (isLastMove) {
								const move: ChessStudyMove = {
									...newMove,
									moveId: moveId,
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

								if (nextMove.san === newMove.san) {
									state.currentMove = nextMove;
									return state;
								}

								const move: ChessStudyMove = {
									...newMove,
									moveId: moveId,
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
						const move: ChessStudyMove = {
							...newMove,
							moveId: moveId,
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
					}

					return state;
				}
				default:
					break;
			}
		},
		// The second argument is the initial state.
		{
			currentMove: chessStudyData.moves[chessStudyData.moves.length - 1] ?? null,
			isViewOnly: false,
			study: chessStudyData,
		},
	);

	const onSaveButtonClick = useCallback(async () => {
		try {
			await dataAdapter.saveFile(gameState.study, chessStudyId);
			new Notice('Save successfull!');
		} catch (e) {
			new Notice('Something went wrong during saving:', e);
		}
	}, [chessStudyId, dataAdapter, gameState.study]);

	return (
		<div className="chess-study">
			<div className="chessground-pgn-container">
				<div className="chessground-container">
					<ChessgroundWrapper
						api={chessView}
						setApi={setChessView}
						config={{
							orientation: boardOrientation,
						}}
						boardColor={boardColor}
						chess={chessLogic}
						onMove={(move: Move) => dispatch({ type: 'ADD_MOVE_TO_HISTORY', move })}
						isViewOnly={gameState.isViewOnly}
						syncShapes={(shapes: DrawShape[]) =>
							dispatch({ type: 'SYNC_SHAPES', shapes })
						}
						shapes={gameState.currentMove?.shapes || []}
					/>
				</div>

				<div className="pgn-container">
					<PgnViewer
						history={gameState.study.moves}
						currentMoveId={gameState.currentMove?.moveId ?? null}
						firstPlayer={firstPlayer}
						initialMoveNumber={initialMoveNumber}
						onMoveItemClick={(moveId: string) =>
							dispatch({
								type: 'DISPLAY_SELECTED_MOVE_IN_HISTORY',
								moveId: moveId,
							})
						}
						disableNavigation={disableNavigation}
						readOnly={readOnly}
						onUndoButtonClick={() =>
							dispatch({ type: 'REMOVE_LAST_MOVE_FROM_HISTORY' })
						}
						onBackButtonClick={() =>
							dispatch({ type: 'DISPLAY_PREVIOUS_MOVE_IN_HISTORY' })
						}
						onForwardButtonClick={() =>
							dispatch({ type: 'DISPLAY_NEXT_MOVE_IN_HISTORY' })
						}
						onSaveButtonClick={onSaveButtonClick}
						onCopyFenButtonClick={() => {
							try {
								navigator.clipboard.writeText(chessLogic.fen());
								new Notice('Copied FEN to clipboard!');
							} catch (e) {
								new Notice('Could not copy FEN to clipboard:', e);
							}
						}}
						onCopyPgnButtonClick={() => {
							try {
								navigator.clipboard.writeText(chessLogic.pgn());
								new Notice('Copied PGN to clipboard!');
							} catch (e) {
								new Notice('Could not copy PGN to clipboard:', e);
							}
						}}
						onSettingsButtonClick={() => {
							try {
								new Notice("I'm afraid I can't do that Dave??");
							} catch (e) {
								new Notice('Something is rotten in Denmark:', e);
							}
						}}
					/>
				</div>
			</div>
			{viewComments && (
				<div className="CommentSection">
					<CommentSection
						currentComment={
							gameState.currentMove
								? gameState.currentMove.comment
									? gameState.currentMove.comment
									: null
								: gameState.study.comment
									? gameState.study.comment
									: null
						}
						setComments={(comment: JSONContent) =>
							dispatch({ type: 'SYNC_COMMENT', comment: comment })
						}
					/>
				</div>
			)}
		</div>
	);
};
