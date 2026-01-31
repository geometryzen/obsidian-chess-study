import { JSONContent } from '@tiptap/react';
import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { App, Notice } from 'obsidian';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ChessStudyPluginSettings } from 'src/components/obsidian/ChessStudyPluginSettingsTab';
import { ChessStudyAppConfig, parseUserConfig } from 'src/lib/obsidian';
import {
	ChessStudyDataAdapter,
	ChessStudyFileContent,
	ChessStudyMove,
	VariantMove,
} from 'src/lib/storage';
import {
	displayRelativeMoveInHistory,
	findMoveIndex,
	getCurrentMove,
	getMoveById,
	updateView,
} from 'src/lib/ui-state';
import { useImmerReducer } from 'use-immer';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { CommentSection } from './CommentSection';
import { PgnViewer } from './PgnViewer';
import { CHESS_STUDY_KIND_PUZZLE, InitialPosition } from 'src/main';

export type ChessStudyConfig = ChessgroundProps;

interface AppProps {
	/**
	 * The markdown source (unparsed).
	 */
	source: string;
	app: App;
	pluginSettings: ChessStudyPluginSettings;
	initialPos: InitialPosition;
	config: ChessStudyAppConfig;
	fileContent: ChessStudyFileContent;
	dataAdapter: ChessStudyDataAdapter;
}

export type GameCurrentMove =
	| Pick<ChessStudyMove, 'moveId' | 'comment' | 'shapes'>
	| Pick<VariantMove, 'moveId' | 'comment' | 'shapes'>
	| null;

export interface GameState {
	// What exactly do we need here
	currentMove: GameCurrentMove;
	isViewOnly: boolean;
	study: ChessStudyFileContent;
}

export type GameActions =
	| { type: 'PLAY_MOVE'; move: Move }
	| { type: 'REMOVE_LAST_MOVE' }
	| { type: 'GOTO_NEXT_MOVE' }
	| { type: 'GOTO_PREV_MOVE' }
	| { type: 'GOTO_MOVE'; moveId: string }
	| { type: 'SYNC_SHAPES'; shapes: DrawShape[] }
	| { type: 'SYNC_COMMENT'; comment: JSONContent | null };

const initialMove = (
	moves: GameCurrentMove[],
	initialPosition: InitialPosition,
): GameCurrentMove => {
	switch (initialPosition) {
		case 'begin': {
			return null;
		}
		case 'first': {
			return moves[0] ?? null;
		}
		case 'end':
		default: {
			return moves[moves.length - 1] ?? null;
		}
	}
};
/**
 * This is the top-level React component in our Markdown renderer.
 */
export const ChessStudy = ({
	source,
	pluginSettings,
	initialPos: initialPosition,
	config,
	// This is destructuring with a rename?
	// The thing on the left is what's coming in, on the right is the destructured name.
	fileContent: data,
	dataAdapter,
}: AppProps) => {
	// Parse Obsidian / Code Block Settings
	const {
		boardColor,
		boardOrientation,
		disableCopy,
		disableNavigation,
		// initialPosition: ignoreMe,
		readOnly,
		chessStudyKind,
		viewComments,
		chessStudyId,
	} = parseUserConfig(pluginSettings, source);

	// Setup Chessground API
	const [chessView, setChessView] = useState<ChessView | null>(null);

	// Setup Chess.js API
	/**
	 *
	 */
	const [initialChessModel, initialPlayer, initialMoveNumber] = useMemo(() => {
		const chess = new ChessModel(data.rootFEN);

		const initialPlayer: 'w' | 'b' = chess.turn();
		const initialMoveNumber = chess.moveNumber();

		switch (config.initialPosition) {
			case 'end': {
				data.moves.forEach((move) => {
					chess.move({
						from: move.from,
						to: move.to,
						promotion: move.promotion,
					});
				});
				break;
			}
			case 'first': {
				const move = data.moves[0];
				if (move) {
					chess.move({
						from: move.from,
						to: move.to,
						promotion: move.promotion,
					});
				}
				break;
			}
			case 'begin':
			default: {
				// Do nothing
			}
		}

		return [chess, initialPlayer, initialMoveNumber];
	}, [data.moves, data.rootFEN, config.initialPosition]);

	const [chessLogic, setChessLogic] = useState(initialChessModel);

	const initialState: GameState = {
		currentMove: initialMove(data.moves, initialPosition),
		isViewOnly: false,
		study: data,
	};

	// Why are we using use-immer instead of React's useReducer hook?
	// The purpose is to have immutable state and the immer librray helps with the handling.
	// This may be more efficient than using mutable state?
	const [gameState, dispatch] = useImmerReducer<GameState, GameActions>(
		// The first argument is the reducer function
		(state, action) => {
			const hasNoMoves = state.study.moves.length === 0;
			switch (action.type) {
				case 'GOTO_NEXT_MOVE': {
					if (!chessView || hasNoMoves) return state;

					state.currentMove = displayRelativeMoveInHistory(
						state,
						chessView,
						setChessLogic,
						{
							offset: 1,
							selectedMoveId: null,
						},
					);

					return state;
				}
				case 'GOTO_PREV_MOVE': {
					if (!chessView || hasNoMoves) return state;

					state.currentMove = displayRelativeMoveInHistory(
						state,
						chessView,
						setChessLogic,
						{
							offset: -1,
							selectedMoveId: null,
						},
					);

					return state;
				}
				case 'REMOVE_LAST_MOVE': {
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
								state.currentMove = displayRelativeMoveInHistory(
									state,
									chessView,
									setChessLogic,
									{
										offset: -1,
										selectedMoveId: currentMoveId,
									},
								);
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
								state.currentMove = displayRelativeMoveInHistory(
									state,
									chessView,
									setChessLogic,
									{
										offset: -1,
										selectedMoveId: currentMoveId,
									},
								);
							}

							moves.pop();

							if (isLastMove) {
								state.currentMove = moves.length > 0 ? moves[moves.length - 1] : null;
							}
						}
					}

					return state;
				}
				case 'GOTO_MOVE': {
					if (!chessView || hasNoMoves) return state;

					const move = getMoveById(state.study.moves, action.moveId);
					updateView(chessView, setChessLogic, move.after);
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
				case 'PLAY_MOVE': {
					if (!chessView) return state;
					// There seems to be a bug whereby if you hit the Back button to get positioned
					// just before the first move, then making the first move adds it to the move list as if it were a new move.
					/**
					 * The move that was played in the current position.
					 */
					// const theMove = action.move;

					const moves = state.study.moves;

					// TODO: No need to allocate an id here because we may not need it.
					// const moveId = nanoid();

					if (state.currentMove) {
						const currentMoveId = state.currentMove.moveId;
						console.log('currentMoveId', currentMoveId);
						const currentMoveIndex = moves.findIndex(
							(move) => move.moveId === currentMoveId,
						);

						const { variant, moveIndex } = findMoveIndex(moves, currentMoveId);

						if (variant) {
							// handle Variation
							const parent = moves[variant.parentMoveIndex];
							const variantMoves = parent.variants[variant.variantIndex].moves;

							const isLastMove = moveIndex === variantMoves.length - 1;

							// Only push if its the last move in the variant because depth can only be 1
							if (isLastMove) {
								const variantMove: ChessStudyMove = {
									...action.move,
									moveId: nanoid(),
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
								variantMoves.push(variantMove);

								const tempChess = new ChessModel(action.move.after);

								state.currentMove = variantMove;

								chessView?.set({
									fen: action.move.after,
									check: tempChess.isCheck(),
								});
							}
						} else {
							// TODO: It would be nice for the different kinds to be handled by different instances of some interface.
							/*
							switch(config.chessStudyKind) {
								case 'game':
								case 'legacy':
								case 'position': {
									break;
								}
								case 'puzzle': {
									break;
								}
							}
							*/
							// handle Main Line
							const isLastMove = currentMoveIndex === moves.length - 1;

							if (isLastMove) {
								const move: ChessStudyMove = {
									...action.move,
									moveId: nanoid(),
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

								if (nextMove.san === action.move.san) {
									switch (chessStudyKind) {
										case CHESS_STUDY_KIND_PUZZLE: {
											const replyMove = moves[moveIndex + 2];
											if (replyMove) {
												updateView(chessView, setChessLogic, replyMove.after);
												state.currentMove = replyMove;
											} else {
												updateView(chessView, setChessLogic, nextMove.after);
												state.currentMove = nextMove;
											}
											return state;
										}
										default: {
											state.currentMove = nextMove;
											return state;
										}
									}
								} else {
									const move: ChessStudyMove = {
										...action.move,
										moveId: nanoid(),
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

								const move: ChessStudyMove = {
									...action.move,
									moveId: nanoid(),
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
						// There is no current move.
						// This means we are positioned at the beginning of the game.
						// If there are no moves in the game then add it as the first move.
						// If there are moves in the game then
						// TODO: This is probably where we should check the moves and proceed accordingly.
						if (moves.length === 0) {
							const move: ChessStudyMove = {
								...action.move,
								moveId: nanoid(),
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
							// Do nothing for now.
							// The problem with doing nothing is that the move will be displayed
							const firstMove = moves[0];

							if (firstMove.san === action.move.san) {
								state.currentMove = firstMove;
								return state;
							} else {
								// What do we do if the moves do not match?
								// I think it becomes a Variation.
							}
						}
					}

					return state;
				}
				default:
					break;
			}
		},
		// The second argument is the initial state.
		initialState,
	);

	// I don't think this can be called since the DOM has not rendered.
	// dispatch({ type: 'GOTO_NEXT_MOVE' });

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
						onMove={(move: Move) => dispatch({ type: 'PLAY_MOVE', move })}
						isViewOnly={gameState.isViewOnly}
						syncShapes={(shapes: DrawShape[]) =>
							dispatch({ type: 'SYNC_SHAPES', shapes })
						}
						shapes={gameState.currentMove?.shapes || []}
					/>
				</div>
				{(chessStudyKind as string) !== 'foo' && (
					<div className="pgn-container">
						<PgnViewer
							history={gameState.study.moves}
							currentMoveId={gameState.currentMove?.moveId ?? null}
							initialPlayer={initialPlayer}
							initialMoveNumber={initialMoveNumber}
							onMoveItemClick={(moveId: string) =>
								dispatch({
									type: 'GOTO_MOVE',
									moveId: moveId,
								})
							}
							disableCopy={disableCopy}
							disableNavigation={disableNavigation}
							readOnly={readOnly}
							chessStudyKind={chessStudyKind}
							onUndoButtonClick={() => dispatch({ type: 'REMOVE_LAST_MOVE' })}
							onBackButtonClick={() => dispatch({ type: 'GOTO_PREV_MOVE' })}
							onForwardButtonClick={() => dispatch({ type: 'GOTO_NEXT_MOVE' })}
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
				)}
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
