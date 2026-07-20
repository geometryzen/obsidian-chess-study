import Box from '@mui/material/Box';
import { generateText, JSONContent } from '@tiptap/react';
import { Chess as ChessPosition, Move } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { DrawShape } from 'chessground/draw';
import { App, Notice } from 'obsidian';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useImmerReducer } from 'use-immer';
import { ChessStudyPluginSettings } from '../../components/obsidian/ChessStudyPluginSettings';
import { initialize_position } from '../../lib/chess-logic/initialize_position';
import { InitialPosition } from '../../lib/config/InitialPosition';
import { jgn_to_pgn_string } from '../../lib/jgn/jgn_to_pgn_string';
import { find_parent } from '../../lib/neo/find_parent';
import { get_neo_move_by_id } from '../../lib/neo/get_neo_move_by_id';
import { get_next_move } from '../../lib/neo/get_next_move';
import { get_variation_next } from '../../lib/neo/get_variation_next.js';
import { get_variation_prev } from '../../lib/neo/get_variation_prev.js';
import { has_neo_move_by_id } from '../../lib/neo/has_neo_move_by_id.js';
import { initial_move_from_neo_study } from '../../lib/neo/initial_node_from_neo_study.js';
//import { moves_from_path } from '../../lib/neo/move_from_path';
import { neo_clone } from '../../lib/neo/neo_clone.js';
import { NeoStudy } from '../../lib/neo/NeoStudy.js';
//import { path_from_move } from '../../lib/neo/path_from_move';
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
import { update_board_view_from_position } from '../../lib/ui-state/update_board_view_from_position';
import { ChessgroundProps, ChessgroundWrapper } from './ChessgroundWrapper';
import { ChessStudyEventHandler } from './ChessStudyEventHandler';
import { CommentSection } from './CommentSection';
import { createChessStudyEventHandler } from './createChessStudyEventHandler';
import { get_current_chessstudy_move } from './get_current_chessstudy_move';
import { has_no_moves } from './has_no_moves';
import { NeoMovesViewer } from './NeoMovesViewer';
import { NeoMove } from '../../lib/neo/NeoMove';
import { get_target_move } from '../../lib/neo/get_target_move';
import StarterKit from '@tiptap/starter-kit';
export type ChessStudyConfig = ChessgroundProps;

interface AppProps {
	/**
	 * The markdown source (unparsed).
	 */
	source: string;
	app: App;
	pluginSettings: ChessStudyPluginSettings;
	// Why does this appear to duplicate the property in the pluginSettings?
	initialPos: InitialPosition;
	config: ChessStudyAppConfig;
	chessStudy: NeoStudy;
	repertoire: NeoStudy | null;
	studyLoader: ChessStudyLoader;
}
/*
export interface MoveToken {
	readonly moveId: string;
	readonly comment: JSONContent | null;
	readonly shapes: DrawShape[];
}
*/

export interface GameState {
	/**
	 * The current move in the chessStudy property.
	 */
	currentChessStudyMove: NeoMove | null;
	/**
	 * The current move in the repertoire property.
	 */
	currentRepertoireMove: NeoMove | null;
	/**
	 *
	 */
	chessStudy: NeoStudy;
	/**
	 *
	 */
	repertoire: NeoStudy | null;
	/**
	 * Determines whether the comments are visible or not.
	 */
	isCommentsHidden: boolean;
	/**
	 * Determines whether the move navigation buttons are visible.
	 */
	isNavigationHidden: boolean;
	/**
	 * Determines whether the notation is visible or not.
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
	if (state.currentChessStudyMove) {
		if (state.currentChessStudyMove.comment) {
			return state.currentChessStudyMove.comment;
		} else {
			if (state.currentRepertoireMove) {
				if (state.currentRepertoireMove.comment) {
					return state.currentRepertoireMove.comment;
				} else {
					return null;
				}
			} else {
				return null;
			}
		}
	} else {
		if (state.chessStudy.comment) {
			return state.chessStudy.comment;
		} else {
			if (state.repertoire) {
				if (state.repertoire.comment) {
					return state.repertoire.comment;
				} else {
					return null;
				}
			} else {
				return null;
			}
		}
	}
	/*
	return state.currentMove
		? state.currentMove.comment
			? state.currentMove.comment
			: null
		: state.chessStudy.comment
			? state.chessStudy.comment
			: null;
	*/
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
	| { type: 'RESET' }
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
	chessStudy,
	repertoire,
	studyLoader,
}: AppProps) => {
	// Parse Obsidian / Code Block Settings
	const {
		boardColor,
		boardOrientation,
		disableCopy,
		disableNavigation,
		disableSave,
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
	const [initialChessModel, initialPlayer, rootMoveNumber] = useMemo(() => {
		const { pos, rootMoveNumber } = initialize_position(
			chessStudy,
			config.initialPosition,
		);

		// TODO: We may have to review this given that we can advance the position using the initialPosition parameter.
		// This may actually be the current player?
		const initialPlayer: 'w' | 'b' = pos.turn();

		return [pos, initialPlayer, rootMoveNumber];
	}, [chessStudy, config.initialPosition]);

	/**
	 * These names are quite good since we would like to use chess.js
	 * in its role as a position analyzer and not for game management (which it does no do so well)
	 */
	const [chessLogic, setChessLogic] = useState(initialChessModel);

	const handler: ChessStudyEventHandler = createChessStudyEventHandler(
		chessStudyKind,
		chessView,
		chessLogic,
		setChessLogic,
	);

	function initial_move() {
		return initial_move_from_neo_study(chessStudy, initialPosition);
	}

	// Because of strict rendering, the initialState is created when the chessView
	const initialState: GameState = {
		/**
		 *
		 */
		currentChessStudyMove: initial_move(),
		currentRepertoireMove: initial_move_from_neo_study(
			repertoire,
			initialPosition,
		),
		/**
		 * Placing this here to illustrate how the game state can migrate toward the tree model.
		 */
		chessStudy,
		/**
		 *
		 */
		repertoire,
		/**
		 * In most cases the comments are visible.
		 * However, in the case of puzzle-like modes, the comments are the hints, and may be hidden.
		 */
		isCommentsHidden: !viewComments,
		/**
		 * In most cases the navigation buttons are visible.
		 * However, in the case of puzzle-like modes, the navigation buttons would provide access to the main line, and may be hidden.
		 */
		isNavigationHidden: disableNavigation,
		/**
		 * In most use cases the notation is visible.
		 * However, in the case of a puzzle-like modes, the notation is the solution, and may be hidden.
		 */
		isNotationHidden: false,
		/**
		 * This property is synchronized with the Board View (currently Chessground).
		 */
		isViewOnly: false,
	};

	handler.setInitialState(
		initialState,
		initialState.currentChessStudyMove,
		initialState.chessStudy,
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
					if (state.currentChessStudyMove) {
						const currentMove = get_neo_move_by_id(
							state.chessStudy,
							state.currentChessStudyMove.moveId,
						);
						if (get_next_move(currentMove)) {
							state.currentChessStudyMove = handler.gotoNextMove(state);
							state.currentRepertoireMove = get_target_move(
								state.currentChessStudyMove,
								state.chessStudy,
								state.repertoire,
							);
						}
					} else {
						state.currentChessStudyMove = handler.gotoNextMove(state);
						state.currentRepertoireMove = get_target_move(
							state.currentChessStudyMove,
							state.chessStudy,
							state.repertoire,
						);
					}
					break;
				}
				case 'GOTO_PREV_MOVE': {
					state.currentChessStudyMove = handler.gotoPrevMove(state);
					state.currentRepertoireMove = get_target_move(
						state.currentChessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
					break;
				}
				case 'DELETE_MOVE': {
					if (!chessView || has_no_moves(state)) return state;
					if (state.currentChessStudyMove) {
						// const moveId = state.currentMove.moveId;
						// For some reason we get two events so we must be idempotent.
						if (has_neo_move_by_id(state.chessStudy, event.moveId)) {
							state.chessStudy = neo_clone(state.chessStudy);
							const target = get_neo_move_by_id(state.chessStudy, event.moveId);
							const parent = find_parent(state.chessStudy.root, target);
							if (parent) {
								if (parent.left === target) {
									parent.left = target.right;
								} else {
									parent.right = target.right;
								}
								state.currentChessStudyMove = parent;
								state.currentRepertoireMove = get_target_move(
									state.currentChessStudyMove,
									state.chessStudy,
									state.repertoire,
								);
								const pos = new ChessPosition(parent.after);
								update_board_view_from_position(chessView, pos);
								setChessLogic(pos);
							} else {
								// We must be deleting the root node
								state.chessStudy.root = null;
								state.currentChessStudyMove = null;
								state.currentRepertoireMove = get_target_move(
									state.currentChessStudyMove,
									state.chessStudy,
									state.repertoire,
								);
								const pos = new ChessPosition(state.chessStudy.rootFEN);
								update_board_view_from_position(chessView, pos);
								setChessLogic(pos);
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
					// When a move is clicked in the user interface, the identifier is from the chessStudy.
					const chessStudyMove = handler.gotoMove(state, event.moveId);
					state.currentChessStudyMove = chessStudyMove;
					state.currentRepertoireMove = get_target_move(
						chessStudyMove,
						state.chessStudy,
						state.repertoire,
					);
					break;
				}
				case 'RESET': {
					handler.reset(state, initialPosition);
					break;
				}
				case 'SYNC_SHAPES': {
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
					if (move) {
						move.shapes = event.shapes;
						// Isn't this redundant? Didn't we just get the current move?
						// Caution: The issue may be that we have changed the comment of the current move.
						state.currentChessStudyMove = move;
						state.currentRepertoireMove = get_target_move(
							state.currentChessStudyMove,
							state.chessStudy,
							state.repertoire,
						);
					} else {
						// We should be allowed to have shapes in the
						state.chessStudy.shapes = event.shapes;
					}
					return state;
				}
				case 'SYNC_COMMENT': {
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
					if (move) {
						if (event.comment) {
							const strval = generateText(event.comment, [StarterKit]);
							if (strval.trim().length > 0) {
								// The comment is genuine is visible to the user.
								// const repertoireMove = get_target_move(move, state.chessStudy,state.repertoire)
								move.comment = event.comment;
							} else {
								// The comment is a blank string.
								// TODO: Experiment with undefined in order to remove the property and make the file compact.
								move.comment = null;
							}
						} else {
							// the comment is null or perhaps undefined
							move.comment = null;
						}
						// Isn't this redundant? Didn't we just get the current move?
						// Caution: The issue may be that we have changed the comment of the current move.
						state.currentChessStudyMove = move;
						state.currentRepertoireMove = get_target_move(
							state.currentChessStudyMove,
							state.chessStudy,
							state.repertoire,
						);
					} else {
						// When there is no current move then we apply the comment to the game itself.
						if (event.comment) {
							// TODO: DRY
							const strval = generateText(event.comment, [StarterKit]);
							if (strval.trim().length > 0) {
								// The comment is genuine is visible to the user.
								state.chessStudy.comment = event.comment;
							} else {
								// The comment is a blank string.
								state.chessStudy.comment = null;
							}
						} else {
							// the comment is null or perhaps undefined
							state.chessStudy.comment = null;
						}
					}
					return state;
				}
				case 'PLAY_MOVE': {
					handler.playMove(
						state,
						event.move,
						config.boardOrientation === 'white' ? 'w' : 'b',
						config.completedPosition,
					);
					return state;
				}
				case 'ANNOTATE_MOVE': {
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
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
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
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
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
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
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
					if (move) {
						const other = get_variation_prev(state.chessStudy.root, move);
						if (other) {
							const uber = find_parent(state.chessStudy.root, other);
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
								state.chessStudy.root = move;
							}
						} else {
							// You can't promote a line if it does not have a superior variation.
						}
					}
					return state;
				}
				case 'DEMOTE_LINE': {
					state.chessStudy = neo_clone(state.chessStudy);
					const move = get_current_chessstudy_move(state);
					if (move) {
						const other = get_variation_next(move);
						if (other) {
							const uber = find_parent(state.chessStudy.root, move);
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
								state.chessStudy.root = other;
							}
						} else {
							// You can't demote a line if it does not have an inferior variation.
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
			await studyLoader.saveNeoStudy(gameState.chessStudy, chessStudyId);
			new Notice('Save successfull!');
		} catch (e) {
			new Notice(`Something went wrong during saving: Cause: ${e}`, 0);
		}
	}, [chessStudyId, studyLoader, gameState.chessStudy]);

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
							study={gameState.chessStudy}
							currentMoveId={gameState.currentChessStudyMove?.moveId ?? null}
							initialPlayer={initialPlayer}
							rootMoveNumber={rootMoveNumber}
							isVisible={!gameState.isNotationHidden}
							onMoveItemClick={(moveId: string) =>
								dispatch({
									type: 'GOTO_MOVE',
									moveId: moveId,
								})
							}
							disableCopy={disableCopy}
							disableNavigation={gameState.isNavigationHidden}
							disableSave={disableSave}
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
									// We currently onle have a serializer from JGN to PGN.
									// So we must convert our NEO structure to JGN and then serialize to PGN.
									// TODO: neo_to_pgn_string function.
									const jgn = jgn_from_neo(gameState.chessStudy);
									const pgn_string = jgn_to_pgn_string(jgn);
									navigator.clipboard.writeText(pgn_string);
									new Notice('Copied PGN to clipboard!');
								} catch (e) {
									console.warn(e);
									console.warn(JSON.stringify(gameState.chessStudy, null, 2));
									new Notice('Could not copy PGN to clipboard:', e);
								}
							}}
							onSaveButtonClick={onSaveButtonClick}
							onDeleteButtonClick={(moveId) => {
								if (gameState.currentChessStudyMove) {
									dispatch({
										type: 'DELETE_MOVE',
										moveId,
									});
								}
							}}
							onResetButtonClick={() => dispatch({ type: 'RESET' })}
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
			{!gameState.isCommentsHidden && (
				<Box className="CommentSection">
					<CommentSection
						currentComment={comment_from_game_state(gameState)}
						setComments={(comment: JSONContent) =>
							dispatch({ type: 'SYNC_COMMENT', comment: comment })
						}
					/>
				</Box>
			)}
		</div>
	);
};
