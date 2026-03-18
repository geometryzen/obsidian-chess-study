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
import { jgn_to_pgn_string } from '../../lib/jgn/jgn_to_pgn_string';
import { find_parent } from '../../lib/neo/find_parent';
import { first_neo_move } from '../../lib/neo/first_neo_move';
import { get_neo_main_line } from '../../lib/neo/get_neo_main_line';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_variation_next } from '../../lib/neo/get_variation_next';
import { get_variation_prev } from '../../lib/neo/get_variation_prev';
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
import { update_view_and_logic } from '../../lib/ui-state/update_view_and_logic';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { CommentSection } from './CommentSection';
import { createChessStudyEventHandler } from './createChessStudyEventHandler';
import { get_current_neo_move } from './get_current_neo_move';
import { has_no_moves } from './has_no_moves';
import { NeoMovesViewer } from './NeoMovesViewer';
import { neo_clone } from '../../lib/neo/neo_clone';
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
	study: NeoStudy;
	studyLoader: ChessStudyLoader;
}

export interface MoveToken {
	readonly moveId: string;
	readonly comment: JSONContent | null;
	readonly shapes: DrawShape[];
}

export interface GameState {
	/**
	 * The same data structure whether 'jgn' or 'neo'
	 */
	currentMove: MoveToken | null;
	/**
	 *
	 */
	study: NeoStudy;
	/**
	 * Determines whether the game notation is visible or not.
	 */
	isNotationHidden: boolean;
	/**
	 * Determines whether the Board View has mouse or pointer interaction.
	 */
	isViewOnly: boolean;
}

/**
 * If there us a current move then we return the comment for that move,
 * Otherwise we return the comment for the study itself.
 */
function comment_from_game_state(
	state: Readonly<GameState>,
): JSONContent | null {
	return state.currentMove
		? state.currentMove.comment
			? state.currentMove.comment
			: null
		: state.study.comment
			? state.study.comment
			: null;
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
	| { type: 'PROMOTE_LINE' }
	| { type: 'DEMOTE_LINE' }
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
	study,
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
		const chess = new ChessJs(study.rootFEN);

		const initialPlayer: 'w' | 'b' = chess.turn();
		const initialMoveNumber = chess.moveNumber();

		switch (config.initialPosition) {
			case 'end': {
				get_neo_main_line(study).forEach((move) => {
					chess.move({
						from: move.from,
						to: move.to,
						promotion: move.promotion,
					});
				});
				break;
			}
			case 'first': {
				const move = first_neo_move(study);
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
				const desiredMove = initial_move_from_neo_study(
					study,
					config.initialPosition,
				);
				if (desiredMove) {
					const moves = get_neo_main_line(study);
					for (let i = 0; i < moves.length; i++) {
						const move = moves[i];
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
	}, [study, config.initialPosition]);

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
		return initial_move_from_neo_study(study, initialPosition);
	}

	// Because of strict rendering, the initialState is created when the chessView
	const initialState: GameState = {
		/**
		 *
		 */
		currentMove: initial_move(),
		/**
		 * Placing this here to illustrate how the game state can migrate toward the tree model.
		 */
		study,
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
		initialState.study,
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
					if (state.currentMove) {
						// const moveId = state.currentMove.moveId;
						// For some reason we get two events so we must be idempotent.
						if (has_neo_move_by_id(state.study, event.moveId)) {
							state.study = neo_clone(state.study);
							const target = get_neo_move_by_id(state.study, event.moveId);
							const parent = find_parent(state.study.root, target);
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
								state.study.root = null;
								state.currentMove = null;
								update_view_and_logic(chessView, setChessLogic, state.study.rootFEN);
							}
						} else {
							// console.lg('Ignoring the event because the node no longer exists');
						}
					} else {
						// console.lg('There is no current move');
					}
					break;
				}
				case 'GOTO_MOVE': {
					state.currentMove = handler.gotoMove(state, event.moveId);
					break;
				}
				case 'SYNC_SHAPES': {
					state.study = neo_clone(state.study);
					const move = get_current_neo_move(state);
					if (move) {
						move.shapes = event.shapes;
						// Isn't this redundant? Didn't we just get the current move?
						// Caution: The issue may be that we have changed the comment of the current move.
						state.currentMove = move;
					} else {
						// We should be allowed to have shapes in the
						state.study.shapes = event.shapes;
					}
					return state;
				}
				case 'SYNC_COMMENT': {
					state.study = neo_clone(state.study);
					const move = get_current_neo_move(state);
					if (move) {
						move.comment = event.comment;
						// Isn't this redundant? Didn't we just get the current move?
						// Caution: The issue may be that we have changed the comment of the current move.
						state.currentMove = move;
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
					state.study = neo_clone(state.study);
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
					state.study = neo_clone(state.study);
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
					}
					return state;
				}
				case 'EVALUATE_POSITION': {
					state.study = neo_clone(state.study);
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
					}
					return state;
				}
				case 'PROMOTE_LINE': {
					state.study = neo_clone(state.study);
					const move = get_current_neo_move(state);
					if (move) {
						const other = get_variation_prev(state.study.root, move);
						if (other) {
							const uber = find_parent(state.study.root, other);
							if (uber) {
								other.right = move.right;
								if (uber.right === other) {
									uber.right = move;
								} else {
									uber.left = move;
								}
								move.right = other;
							} else {
								// The other was the root, now the root will be the move.
								other.right = move.right;
								move.right = other;
								state.study.root = move;
							}
						} else {
							// You can't promote a move if it does not have a superior variation.
						}
					}
					return state;
				}
				case 'DEMOTE_LINE': {
					state.study = neo_clone(state.study);
					const move = get_current_neo_move(state);
					if (move) {
						const other = get_variation_next(move);
						if (other) {
							const uber = find_parent(state.study.root, move);
							if (uber) {
								move.right = other.right;
								if (uber.right === move) {
									uber.right = other;
								} else {
									uber.left = other;
								}
								other.right = move;
							} else {
								// The move was the root, now the root will be the other.
								move.right = other.right;
								other.right = move;
								state.study.root = other;
							}
						} else {
							// You can't demote a move if it already the highest.
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
			await studyLoader.saveNeoStudy(gameState.study, chessStudyId);
			new Notice('Save successfull!');
		} catch (e) {
			new Notice(`Something went wrong during saving: Cause: ${e}`, 0);
		}
	}, [chessStudyId, studyLoader, gameState.study]);

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
				{
					<div className="pgn-container">
						<NeoMovesViewer
							study={gameState.study}
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
									const jgn = jgn_from_neo(gameState.study);
									const pgn_string = jgn_to_pgn_string(jgn);
									navigator.clipboard.writeText(pgn_string);
									new Notice('Copied PGN to clipboard!');
								} catch (e) {
									console.warn(e);
									console.warn(JSON.stringify(gameState.study, null, 2));
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
							onPromoteLine={() => dispatch({ type: 'PROMOTE_LINE' })}
							onDemoteLine={() => dispatch({ type: 'DEMOTE_LINE' })}
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
				}
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
