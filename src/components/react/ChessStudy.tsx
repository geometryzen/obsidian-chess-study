import { JSONContent } from '@tiptap/react';
import { Chess as ChessJs, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { App, Notice } from 'obsidian';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useImmerReducer } from 'use-immer';
import { ChessStudyPluginSettings } from '../../components/obsidian/ChessStudyPluginSettings';
import { InitialPosition } from '../../lib/config/InitialPosition';
import { find_move_index_from_move_id } from '../../lib/jgn/find_move_index_from_move_id';
import { first_jgn_move } from '../../lib/jgn/first_jgn_move';
import { get_jgn_main_line } from '../../lib/jgn/get_jgn_main_line';
import { initial_move_from_jgn_study } from '../../lib/jgn/initial_move_from_jgn_study';
import { jgn_to_pgn_string } from '../../lib/jgn/jgn_to_pgn_string';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { find_parent } from '../../lib/neo/find_parent';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_main_line } from '../../lib/neo/get_neo_main_line';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { has_neo_move_by_id } from '../../lib/neo/has_neo_move_by_id';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study';
import { NeoStudy } from '../../lib/neo/NeoStudy';
import {
	annotate_move_blunder,
	annotate_move_correct,
	annotate_move_inaccurate,
	annotate_move_mistake,
	decrease_move_evaluation,
	decrease_position_evaluation,
	increase_move_evaluation,
	increase_position_evaluation,
	NAG_null,
	NAG_poor_move,
	NAG_questionable_move,
	NAG_very_poor_move,
	NumericAnnotationGlyph,
} from '../../lib/NumericAnnotationGlyphs';
import { ChessStudyLoader } from '../../lib/obsidian/ChessStudyLoader';
import {
	ChessStudyAppConfig,
	parse_user_config,
} from '../../lib/obsidian/parse_user_config';
import { jgn_from_neo } from '../../lib/transform/jgn_from_neo';
import { moves_from_node } from '../../lib/transform/moves_from_node';
import { neo_from_jgn } from '../../lib/transform/neo_from_jgn';
import { displayRelativeMoveInHistory } from '../../lib/ui-state/display_relative_move';
import { update_view_and_logic } from '../../lib/ui-state/update_view_and_logic';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { CommentSection } from './CommentSection';
import { createChessStudyEventHandler } from './createChessStudyEventHandler';
import { get_current_jgn_move } from './get_current_jgn_move';
import { get_current_neo_move } from './get_current_neo_move';
import { has_no_moves } from './has_no_moves';
import { PgnViewer } from './PgnViewer';
export type ChessStudyConfig = ChessgroundProps;

/**
 * Determines which data model to use as canonical.
 * This is scaffolding until we transition fully to 'neo'.
 */
const MASTER: 'jgn' | 'neo' = 'neo' as 'jgn' | 'neo';

interface AppProps {
	/**
	 * The markdown source (unparsed).
	 */
	source: string;
	app: App;
	pluginSettings: ChessStudyPluginSettings;
	initialPos: InitialPosition;
	config: ChessStudyAppConfig;
	jgnStudy: JgnStudy;
	neoStudy: NeoStudy;
	studyLoader: ChessStudyLoader;
}

export interface MoveToken {
	readonly moveId: string;
	readonly comment: JSONContent | null;
	readonly shapes: DrawShape[];
}

export interface GameState {
	master: 'jgn' | 'neo';
	/**
	 * The same data structure whether 'jgn' or 'neo'
	 */
	currentMove: MoveToken | null;
	/**
	 * This part is what goes in the file.
	 * It is a similar to a PGN in content except
	 */
	jgnStudy: JgnStudy;
	/**
	 *
	 */
	neoStudy: NeoStudy;
	/**
	 * Determines whether the game notation is visible or not.
	 */
	isNotationHidden: boolean;
	/**
	 * Determines whether the Board View has mouse or pointer interaction.
	 */
	isViewOnly: boolean;
}

function comment_from_game_state(state: GameState): JSONContent | null {
	switch (state.master) {
		case 'neo': {
			return state.currentMove
				? state.currentMove.comment
					? state.currentMove.comment
					: null
				: state.neoStudy.comment
					? state.neoStudy.comment
					: null;
			break;
		}
		case 'jgn': {
			return state.currentMove
				? state.currentMove.comment
					? state.currentMove.comment
					: null
				: state.jgnStudy.comment
					? state.jgnStudy.comment
					: null;
			break;
		}
	}
}

export type GameEvent =
	| { type: 'PLAY_MOVE'; move: Move }
	| { type: 'DELETE_MOVE'; moveId: string }
	| { type: 'GOTO_BEGIN_POSITION' }
	| { type: 'GOTO_NEXT_MOVE' }
	| { type: 'GOTO_PREV_MOVE' }
	| { type: 'GOTO_END_POSITION' }
	| { type: 'GOTO_MOVE'; moveId: string }
	| { type: 'ANNOTATE_MOVE'; glyph: NumericAnnotationGlyph }
	| { type: 'EVALUATE_MOVE'; direction: 1 | -1 }
	| { type: 'EVALUATE_POSITION'; direction: 1 | -1 }
	| { type: 'SYNC_SHAPES'; shapes: DrawShape[] }
	| { type: 'SYNC_COMMENT'; comment: JSONContent | null };

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
	jgnStudy,
	neoStudy,
	studyLoader,
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
		const chess = new ChessJs(jgnStudy.rootFEN);

		const initialPlayer: 'w' | 'b' = chess.turn();
		const initialMoveNumber = chess.moveNumber();

		switch (config.initialPosition) {
			case 'end': {
				switch (MASTER) {
					case 'jgn': {
						get_jgn_main_line(jgnStudy).forEach((move) => {
							chess.move({
								from: move.from,
								to: move.to,
								promotion: move.promotion,
							});
						});
						break;
					}
					case 'neo': {
						get_neo_main_line(neoStudy).forEach((move) => {
							chess.move({
								from: move.from,
								to: move.to,
								promotion: move.promotion,
							});
						});
						break;
					}
				}
				break;
			}
			case 'first': {
				switch (MASTER) {
					case 'jgn': {
						const move = first_jgn_move(jgnStudy);
						if (move) {
							chess.move({
								from: move.from,
								to: move.to,
								promotion: move.promotion,
							});
						}
						break;
					}
					case 'neo': {
						const move = first_neo_move(neoStudy);
						if (move) {
							chess.move({
								from: move.from,
								to: move.to,
								promotion: move.promotion,
							});
						}
						break;
					}
				}
				break;
			}
			case 'begin': {
				// Do nothing.
				break;
			}
			default: {
				// TODO: switch on MASTER
				const desiredMove = initial_move_from_jgn_study(
					jgnStudy,
					config.initialPosition,
				);
				if (desiredMove) {
					for (let i = 0; i < jgnStudy.moves.length; i++) {
						const move = jgnStudy.moves[i];
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
				try {
					const desiredNode = initial_move_from_neo_study(
						neoStudy,
						config.initialPosition,
					);
					if (desiredNode) {
						// TODO
					}
				} catch (e) {
					new Notice(`${e}`, 0);
				}
			}
		}

		return [chess, initialPlayer, initialMoveNumber];
	}, [jgnStudy, neoStudy, config.initialPosition]);

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

	function initial_move() {
		switch (MASTER) {
			case 'jgn': {
				return initial_move_from_jgn_study(jgnStudy, initialPosition);
			}
			case 'neo': {
				return initial_move_from_neo_study(neoStudy, initialPosition);
			}
		}
	}

	// Because of strict rendering, the initialState is created when the chessView
	const initialState: GameState = {
		master: MASTER,
		/**
		 *
		 */
		currentMove: initial_move(),
		/**
		 * The "legacy" data structure is in fact the serialization format - JSON Game Notation (proprietary) a.k.a. Jgn.
		 */
		jgnStudy,
		/**
		 * Placing this here to illustrate how the game state can migrate toward the tree model.
		 */
		neoStudy,
		/**
		 * In most use cases the notation is visible.
		 * However, in the case of a puzzle, the notation is the solution, and may be hidden.
		 */
		isNotationHidden: false,
		/**
		 * This property is synchronized with the Board View (currently Chessground).
		 */
		isViewOnly: false,
	};

	handler.setInitialState(
		initialState,
		initialState.currentMove,
		initialState.neoStudy,
		initialState.jgnStudy,
	);
	/*
	const reducer: ImmerReducer<GameState, GameEvent> = (state, event) => {

	}
	*/

	// Why are we using use-immer instead of React's useReducer hook?
	// The purpose is to have immutable state and the immer librray helps with the handling.
	// This may be more efficient than using mutable state?
	const [gameState, dispatch] = useImmerReducer<GameState, GameEvent>(
		// The first argument is the reducer function
		(state: GameState, event: GameEvent) => {
			switch (event.type) {
				case 'GOTO_NEXT_MOVE': {
					state.currentMove = handler.gotoNextMove(state);
					break;
				}
				case 'GOTO_PREV_MOVE': {
					handler.gotoPrevMove(state);
					break;
				}
				case 'DELETE_MOVE': {
					if (!chessView || has_no_moves(state)) return state;
					switch (state.master) {
						case 'jgn': {
							if (state.currentMove) {
								const moveId = state.currentMove.moveId;
								const moves = state.jgnStudy.moves;
								const { indexLocation, moveIndex } = find_move_index_from_move_id(
									moves,
									moveId,
								);

								if (indexLocation) {
									// The current move belongs to a variation, not the Main Line.
									const parent = moves[indexLocation.mainLineMoveIndex];
									const variantMoves =
										parent.variants[indexLocation.variationIndex].moves;

									const isLastMove = moveIndex === variantMoves.length - 1;

									if (isLastMove) {
										state.currentMove = displayRelativeMoveInHistory(
											state,
											chessView,
											setChessLogic,
											{
												offset: -1,
												selectedMoveId: moveId,
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
												selectedMoveId: moveId,
											},
										);
									}

									moves.pop();

									if (isLastMove) {
										state.currentMove = moves.length > 0 ? moves[moves.length - 1] : null;
									}
								}
							}
							state.neoStudy = neo_from_jgn(state.jgnStudy);
							break;
						}
						case 'neo': {
							if (state.currentMove) {
								// const moveId = state.currentMove.moveId;
								// For some reason we get two events so we must be idempotent.
								if (has_neo_move_by_id(state.neoStudy, event.moveId)) {
									try {
										const target = get_neo_move_by_id(state.neoStudy, event.moveId);
										const parent = find_parent(state.neoStudy.root, target);
										if (parent) {
											if (parent.left === target) {
												parent.left = target.right;
											} else {
												parent.right = target.right;
											}
											state.currentMove = parent;
											update_view_and_logic(chessView, setChessLogic, parent.after);
										} else {
											// We must be deleting the root node
											state.neoStudy.root = null;
											state.currentMove = null;
											update_view_and_logic(
												chessView,
												setChessLogic,
												state.neoStudy.rootFEN,
											);
										}
									} finally {
										state.jgnStudy.moves = jgn_from_neo(state.neoStudy).moves;
										state.jgnStudy.moves = moves_from_node(state.neoStudy.root);
									}
								} else {
									// console.lg('Ignoring the event because the node no longer exists');
								}
							} else {
								// console.lg('There is no current move');
							}
							break;
						}
					}
					break;
				}
				case 'GOTO_MOVE': {
					state.currentMove = handler.gotoMove(state, event.moveId);
					break;
				}
				case 'SYNC_SHAPES': {
					if (!chessView || has_no_moves(state)) return state;
					switch (state.master) {
						case 'jgn': {
							const move = get_current_jgn_move(state);
							if (move) {
								move.shapes = event.shapes;
								// Isn't this redundant? Didn't we just get the current move?
								// Caution: The issue may be that we have changed the comment of the current move.
								state.currentMove = move;
								state.neoStudy = neo_from_jgn(state.jgnStudy);
							}
							break;
						}
						case 'neo': {
							const move = get_current_neo_move(state);
							if (move) {
								move.shapes = event.shapes;
								// Isn't this redundant? Didn't we just get the current move?
								// Caution: The issue may be that we have changed the comment of the current move.
								state.currentMove = move;
								state.jgnStudy = jgn_from_neo(state.neoStudy);
							}
							break;
						}
					}
					return state;
				}
				case 'SYNC_COMMENT': {
					if (!chessView || has_no_moves(state)) return state;
					switch (state.master) {
						case 'jgn': {
							const move = get_current_jgn_move(state);
							if (move) {
								move.comment = event.comment;
								// Isn't this redundant? Didn't we just get the current move?
								// Caution: The issue may be that we have changed the comment of the current move.
								state.currentMove = move;
							} else {
								state.jgnStudy.comment = event.comment;
							}
							state.neoStudy = neo_from_jgn(state.jgnStudy);
							break;
						}
						case 'neo': {
							const move = get_current_neo_move(state);
							if (move) {
								move.comment = event.comment;
								// Isn't this redundant? Didn't we just get the current move?
								// Caution: The issue may be that we have changed the comment of the current move.
								state.currentMove = move;
							} else {
								state.neoStudy.comment = event.comment;
							}
							state.jgnStudy = jgn_from_neo(state.neoStudy);
							break;
						}
					}

					return state;
				}
				case 'PLAY_MOVE': {
					handler.playMove(state, event.move);
					return state;
				}
				case 'ANNOTATE_MOVE': {
					const move = get_current_neo_move(state);
					if (move) {
						switch (event.glyph) {
							case NAG_null: {
								move.nags = annotate_move_correct(move.nags);
								break;
							}
							case NAG_questionable_move: {
								move.nags = annotate_move_inaccurate(move.nags);
								break;
							}
							case NAG_poor_move: {
								move.nags = annotate_move_mistake(move.nags);
								break;
							}
							case NAG_very_poor_move: {
								move.nags = annotate_move_blunder(move.nags);
								break;
							}
							default: {
								new Notice(`${move.san} ${event.glyph}`);
							}
						}
					} else {
						// Do nothing
					}
					return state;
				}
				case 'EVALUATE_MOVE': {
					switch (state.master) {
						case 'jgn': {
							const move = get_current_jgn_move(state);
							if (move) {
								switch (event.direction) {
									case 1: {
										move.nags = increase_move_evaluation(move.nags);
										break;
									}
									case -1: {
										move.nags = decrease_move_evaluation(move.nags);
										break;
									}
									default: {
										new Notice(`${move.san} ${event.direction}`);
									}
								}
								state.neoStudy = neo_from_jgn(state.jgnStudy);
							}
							break;
						}
						case 'neo': {
							const move = get_current_neo_move(state);
							if (move) {
								switch (event.direction) {
									case 1: {
										move.nags = increase_move_evaluation(move.nags);
										break;
									}
									case -1: {
										move.nags = decrease_move_evaluation(move.nags);
										break;
									}
									default: {
										new Notice(`${move.san} ${event.direction}`);
									}
								}
								state.jgnStudy = jgn_from_neo(state.neoStudy);
							}
							break;
						}
					}
					return state;
				}
				case 'EVALUATE_POSITION': {
					switch (state.master) {
						case 'jgn': {
							const move = get_current_jgn_move(state);
							if (move) {
								switch (event.direction) {
									case 1: {
										move.nags = increase_position_evaluation(move.nags);
										break;
									}
									case -1: {
										move.nags = decrease_position_evaluation(move.nags);
										break;
									}
									default: {
										new Notice(`${move.san} ${event.direction}`);
									}
								}
								state.neoStudy = neo_from_jgn(state.jgnStudy);
							}
							break;
						}
						case 'neo': {
							const move = get_current_neo_move(state);
							if (move) {
								switch (event.direction) {
									case 1: {
										move.nags = increase_position_evaluation(move.nags);
										break;
									}
									case -1: {
										move.nags = decrease_position_evaluation(move.nags);
										break;
									}
									default: {
										new Notice(`${move.san} ${event.direction}`);
									}
								}
								state.jgnStudy = jgn_from_neo(state.neoStudy);
							}
							break;
						}
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
			// We are writing twice, Neo BEFORE Jgn, until such time as the NeoStudy is the canonical study.
			switch (gameState.master) {
				case 'jgn': {
					await studyLoader.saveJgnStudy(gameState.jgnStudy, chessStudyId);
					break;
				}
				case 'neo': {
					await studyLoader.saveNeoStudy(gameState.neoStudy, chessStudyId);
					break;
				}
			}
			new Notice('Save successfull!');
		} catch (e) {
			new Notice(`Something went wrong during saving: Cause: ${e}`, 0);
		}
	}, [
		chessStudyId,
		studyLoader,
		gameState.jgnStudy,
		gameState.neoStudy,
		gameState.master,
	]);

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
						shapes={handler.shapes(gameState)}
					/>
				</div>
				{(chessStudyKind as string) !== 'foo' && (
					<div className="pgn-container">
						<PgnViewer
							jgnMoves={gameState.jgnStudy.moves}
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
									const pgn_string = jgn_to_pgn_string(gameState.jgnStudy);
									// console.lg('pgn', pgn_string);
									navigator.clipboard.writeText(pgn_string);
									new Notice('Copied PGN to clipboard!');
								} catch (e) {
									console.warn(e);
									console.warn(JSON.stringify(gameState.jgnStudy, null, 2));
									new Notice('Could not copy PGN to clipboard:', e);
								}
							}}
							onSaveButtonClick={onSaveButtonClick}
							onDeleteButtonClick={(moveId) => {
								if (gameState.currentMove) {
									dispatch({
										type: 'DELETE_MOVE',
										moveId,
									});
								}
							}}
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
							onIncreaseMoveAnnotation={() =>
								dispatch({ type: 'EVALUATE_MOVE', direction: +1 })
							}
							onDecreaseMoveAnnotation={() =>
								dispatch({ type: 'EVALUATE_MOVE', direction: -1 })
							}
							onIncreasePositionEvaluation={() =>
								dispatch({ type: 'EVALUATE_POSITION', direction: +1 })
							}
							onDecreasePositionEvaluation={() =>
								dispatch({ type: 'EVALUATE_POSITION', direction: -1 })
							}
							onSearchDatabase={() => {
								try {
									new Notice("I'm afraid I can't do that Dave!");
								} catch (e) {
									new Notice('Something is rotten in Denmark:', e);
								}
							}}
							onSettingsButtonClick={() => {
								try {
									new Notice("I'm afraid I can't do that Dave!");
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
						currentComment={comment_from_game_state(gameState)}
						setComments={(comment: JSONContent) =>
							dispatch({ type: 'SYNC_COMMENT', comment: comment })
						}
					/>
				</div>
			)}
		</div>
	);
};
