import { JSONContent } from '@tiptap/react';
import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
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
} from 'src/lib/ui-state';
import { InitialPosition } from 'src/main';
import { useImmerReducer } from 'use-immer';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { CommentSection } from './CommentSection';
import { createChessStudyEventHandler } from './createChessStudyEventHandler';
import { PgnViewer } from './PgnViewer';

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
	/**
	 * Most importantly, we have the `moveId` property.
	 * But there is also the `comment` and the `shapes` property.
	 */
	currentMove: GameCurrentMove;
	/**
	 * How is this used?
	 */
	isViewOnly: boolean;
	/**
	 * This part is what goes in the file.
	 * It is a similar to a PGN in content except
	 */
	study: ChessStudyFileContent;
}

export type GameEvent =
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

	const handler: ChessStudyEventHandler = createChessStudyEventHandler(
		chessStudyKind,
		chessView,
		setChessLogic,
	);

	// Why are we using use-immer instead of React's useReducer hook?
	// The purpose is to have immutable state and the immer librray helps with the handling.
	// This may be more efficient than using mutable state?
	const [gameState, dispatch] = useImmerReducer<GameState, GameEvent>(
		// The first argument is the reducer function
		(state: GameState, event: GameEvent) => {
			const hasNoMoves = state.study.moves.length === 0;
			switch (event.type) {
				case 'GOTO_NEXT_MOVE': {
					handler.gotoNextMove(state);
					return state;
				}
				case 'GOTO_PREV_MOVE': {
					handler.gotoPrevMove(state);
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
					handler.gotoMove(state, event.moveId);
					return state;
				}
				case 'SYNC_SHAPES': {
					if (!chessView || hasNoMoves) return state;

					const move = getCurrentMove(state);

					if (move) {
						move.shapes = event.shapes;
						state.currentMove = move;
					}

					return state;
				}
				case 'SYNC_COMMENT': {
					if (!chessView || hasNoMoves) return state;

					const move = getCurrentMove(state);

					if (move) {
						move.comment = event.comment;
						state.currentMove = move;
					}

					return state;
				}
				case 'PLAY_MOVE': {
					handler.playMove(state, event.move);
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
