import { parse, ParseTree } from '@mliebelt/pgn-parser';
import { JSONContent } from '@tiptap/react';
import { Chess as ChessModel, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { App, Notice } from 'obsidian';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { InitialPosition } from '../../main';
import { useImmerReducer } from 'use-immer';
import { ChessStudyPluginSettings } from '../../components/obsidian/ChessStudyPluginSettings';
import {
	annotate_move_blunder,
	annotate_move_correct,
	annotate_move_inaccurate,
	annotate_move_mistake,
	decrease_position_evaluation,
	increase_position_evaluation,
	NAG_null,
	NAG_poor_move,
	NAG_questionable_move,
	NAG_very_poor_move,
	NumericAnnotationGlyph,
} from '../../lib/NumericAnnotationGlyphs';
import {
	ChessStudyAppConfig,
	parse_user_config,
} from '../../lib/obsidian/parse_user_config';
import { ChessStudyFileContent, ChessStudyMove } from '../../lib/storage';
import { ChessStudyDataAdapter } from '../../lib/storage/ChessStudyDataAdapter';
import { chess_study_to_pgn_string } from '../../lib/storage/study_to_pgn';
import {
	displayRelativeMoveInHistory,
	getCurrentMove,
} from '../../lib/ui-state';
import { find_move_index_from_move_id } from '../../lib/ui-state/find_move_index_from_move_id';
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

export type GameCurrentMove = Pick<
	ChessStudyMove,
	'moveId' | 'comment' | 'shapes'
> | null;

export interface GameState {
	/**
	 * Most importantly, we have the `moveId` property.
	 * But there is also the `comment` and the `shapes` property.
	 */
	currentMove: GameCurrentMove;
	/**
	 * Determines whether the game notation is visible or not.
	 */
	isNotationHidden: boolean;
	/**
	 * Determines whether the Board View has mouse or pointer interaction.
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
	| { type: 'GOTO_BEGIN_POSITION' }
	| { type: 'GOTO_NEXT_MOVE' }
	| { type: 'GOTO_PREV_MOVE' }
	| { type: 'GOTO_END_POSITION' }
	| { type: 'GOTO_MOVE'; moveId: string }
	| { type: 'ANNOTATE_MOVE'; glyph: NumericAnnotationGlyph }
	| { type: 'EVALUATE_POSITION'; direction: 1 | -1 }
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
		case 'end': {
			return moves[moves.length - 1] ?? null;
		}
		default: {
			// We are currently defaulting to the last move (legacy behavior)
			const game = parse(initialPosition, { startRule: 'game' }) as ParseTree;
			if (Array.isArray(game.moves)) {
				const ipmoves = game.moves;
				if (ipmoves.length === 1) {
					const ipmove = ipmoves[0];
					const moveNumber = ipmove.moveNumber;
					// The PGN parsing library seems to get the color wrong.
					const turn = initialPosition.contains('...') ? 'b' : 'w';
					// The following needs refinement for when the first move does not start at 1.
					const index =
						turn === 'w' ? 2 * (moveNumber - 1) : 2 * (moveNumber - 1) + 1;
					const move = moves[index];
					return move;
				}
			}
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
	} = parse_user_config(pluginSettings, source);

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
			case 'begin': {
				// Do nothing.
				break;
			}
			default: {
				const desiredMove = initialMove(data.moves, config.initialPosition);
				if (desiredMove) {
					for (let i = 0; i < data.moves.length; i++) {
						const move = data.moves[i];
						chess.move({
							from: move.from,
							to: move.to,
							promotion: move.promotion,
						});
						if (desiredMove.moveId === move.moveId) {
							break;
						}
					}
				}
			}
		}

		return [chess, initialPlayer, initialMoveNumber];
	}, [data.moves, data.rootFEN, config.initialPosition]);

	/**
	 * These names are quite good since we would like to use chess.js
	 * in its role as a position analyzer and not for game management (which it does no do so well)
	 */
	const [chessLogic, setChessLogic] = useState(initialChessModel);

	const handler: ChessStudyEventHandler = createChessStudyEventHandler(
		chessStudyKind,
		chessView,
		setChessLogic,
	);

	// Because of strict rendering, the initialState is created when the chessView
	const initialState: GameState = {
		currentMove: initialMove(data.moves, initialPosition),
		/**
		 * In most use cases the notation is visible.
		 * However, in the case of a puzzle, the notation is the solution, and may be hidden.
		 */
		isNotationHidden: false,
		/**
		 * This property is synchronized with the Board View (currently Chessground).
		 */
		isViewOnly: false,

		study: data,
	};

	handler.setInitialState(
		initialState,
		initialState.currentMove,
		initialState.study,
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
						const { indexLocation, moveIndex } = find_move_index_from_move_id(
							moves,
							currentMoveId,
						);

						if (indexLocation) {
							// The current move belongs to a variation, not the Main Line.
							const parent = moves[indexLocation.mainLineMoveIndex];
							const variantMoves = parent.variants[indexLocation.variationIndex].moves;

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
								parent.variants.splice(indexLocation.variationIndex, 1);
							}

							if (isLastMove) {
								state.currentMove =
									variantMoves.length > 0
										? variantMoves[variantMoves.length - 1]
										: moves[indexLocation.mainLineMoveIndex];
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

					const currentMove = getCurrentMove(state);

					if (currentMove) {
						currentMove.comment = event.comment;
						state.currentMove = currentMove;
					} else {
						state.study.comment = event.comment;
					}

					return state;
				}
				case 'PLAY_MOVE': {
					handler.playMove(state, event.move);
					return state;
				}
				case 'ANNOTATE_MOVE': {
					const currentMove = getCurrentMove(state);

					if (currentMove) {
						switch (event.glyph) {
							case NAG_null: {
								currentMove.nags = annotate_move_correct(currentMove.nags);
								break;
							}
							case NAG_questionable_move: {
								currentMove.nags = annotate_move_inaccurate(currentMove.nags);
								break;
							}
							case NAG_poor_move: {
								currentMove.nags = annotate_move_mistake(currentMove.nags);
								break;
							}
							case NAG_very_poor_move: {
								currentMove.nags = annotate_move_blunder(currentMove.nags);
								break;
							}
							default: {
								new Notice(`${currentMove.san} ${event.glyph}`);
							}
						}
					} else {
						// Do nothing
					}
					return state;
				}
				case 'EVALUATE_POSITION': {
					const currentMove = getCurrentMove(state);

					if (currentMove) {
						switch (event.direction) {
							case 1: {
								currentMove.nags = increase_position_evaluation(currentMove.nags);
								break;
							}
							case -1: {
								currentMove.nags = decrease_position_evaluation(currentMove.nags);
								break;
							}
							default: {
								new Notice(`${currentMove.san} ${event.direction}`);
							}
						}
					} else {
						// Do nothing
					}
					return state;
				}
				default: {
					break;
				}
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
							isVisible={!gameState.isNotationHidden}
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
							onBeginButtonClick={() => dispatch({ type: 'GOTO_BEGIN_POSITION' })}
							onBackButtonClick={() => dispatch({ type: 'GOTO_PREV_MOVE' })}
							onForwardButtonClick={() => dispatch({ type: 'GOTO_NEXT_MOVE' })}
							onEndButtonClick={() => dispatch({ type: 'GOTO_END_POSITION' })}
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
									const pgn_string = chess_study_to_pgn_string(gameState.study);
									// console.lg('pgn', pgn_string);
									navigator.clipboard.writeText(pgn_string);
									new Notice('Copied PGN to clipboard!');
								} catch (e) {
									console.warn(e);
									console.warn(JSON.stringify(gameState.study, null, 2));
									new Notice('Could not copy PGN to clipboard:', e);
								}
							}}
							onSaveButtonClick={onSaveButtonClick}
							onDeleteButtonClick={() => dispatch({ type: 'REMOVE_LAST_MOVE' })}
							onAnnotateMoveCorrect={() =>
								dispatch({ type: 'ANNOTATE_MOVE', glyph: NAG_null })
							}
							onAnnotateMoveInaccurate={() =>
								dispatch({ type: 'ANNOTATE_MOVE', glyph: NAG_questionable_move })
							}
							onAnnotateMoveMistake={() =>
								dispatch({ type: 'ANNOTATE_MOVE', glyph: NAG_poor_move })
							}
							onAnnotateMoveBlunder={() =>
								dispatch({ type: 'ANNOTATE_MOVE', glyph: NAG_very_poor_move })
							}
							onIncreasePositionEvaluation={() =>
								dispatch({ type: 'EVALUATE_POSITION', direction: +1 })
							}
							onDecreasePositionEvaluation={() =>
								dispatch({ type: 'EVALUATE_POSITION', direction: -1 })
							}
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
