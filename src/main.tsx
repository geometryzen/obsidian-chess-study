import { Editor, Notice, Plugin, normalizePath } from 'obsidian';
import {
	CURRENT_STORAGE_VERSION,
	ChessStudyDataAdapter,
	ChessStudyFileContent,
} from 'src/lib/storage';
import { ChessStudyMarkdownRenderChild } from './components/obsidian/ChessStudyMarkdownRenderChild';
import { ChessStudyInsertModal } from './components/obsidian/ChessStudyInsertModal';
import {
	ChessStudyPluginSettings,
	DEFAULT_SETTINGS,
	ChessStudyPluginSettingsTab,
} from './components/obsidian/ChessStudyPluginSettingsTab';

// these styles must be imported somewhere
import { JSONContent } from '@tiptap/react';
import 'assets/board/green.css';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import { nanoid } from 'nanoid';
import { parseChessString } from './lib/chess-logic';
import { parseUserConfig } from './lib/obsidian';
import './main.css';

type FEN = string;
type PGN = string;
export type ChessString = FEN | PGN;
export type ChessStudyKind = 'game' | 'puzzle' | 'position' | 'legacy';
export const CHESS_STUDY_KIND_YAML_NAME = 'chessStudyKind';
export const CHESS_STUDY_KIND_GAME: ChessStudyKind = 'game';
export const CHESS_STUDY_KIND_POSITION: ChessStudyKind = 'position';
export const CHESS_STUDY_KIND_PUZZLE: ChessStudyKind = 'puzzle';
export const CHESS_STUDY_KIND_LEGACY: ChessStudyKind = 'legacy';
export type BoardOrientation = 'white' | 'black';
export type BoardColor = 'green' | 'brown';
export type InitialPosition = 'begin' | 'first' | 'end';
export const INITIAL_POSITION_YAML_NAME = 'initialPosition';
export const INITIAL_POSITION_BEGIN: InitialPosition = 'begin';
export const INITIAL_POSITION_END: InitialPosition = 'end';
export const INITIAL_POSITION_FIRST: InitialPosition = 'first';

export const ROOT_FEN =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// TODO:
// 1) Allow to show the root position
// 2) Display correct move after removing the last move

export default class ChessStudyPlugin extends Plugin {
	settings: ChessStudyPluginSettings;
	dataAdapter: ChessStudyDataAdapter;
	storagePath = normalizePath(
		`${this.app.vault.configDir}/plugins/${this.manifest.id}/storage/`,
	);

	/**
	 * @override
	 */
	async onload(): Promise<void> {
		// Load Settings
		await this.loadSettings();

		// Register Data Adapter
		this.dataAdapter = new ChessStudyDataAdapter(
			this.app.vault.adapter,
			this.storagePath,
		);

		await this.dataAdapter.createStorageFolderIfNotExists();

		// Add settings tab
		this.addSettingTab(new ChessStudyPluginSettingsTab(this.app, this));

		// Add command
		this.addCommand({
			id: 'insert-chess-study',
			name: 'Insert FEN/PGN-Editor at cursor position',
			editorCallback: (editor: Editor) => {
				const cursorPosition = editor.getCursor();

				const onSubmit = async (
					chessString: ChessString | undefined,
					boardOrientation: BoardOrientation,
					disableCopy: boolean,
					disableNavigation: boolean,
					initialPosition: InitialPosition,
					readOnly: boolean,
					chessStudyKind: ChessStudyKind,
					viewComments: boolean,
				) => {
					try {
						const chessStringTrimmed = chessString?.trim() ?? '';
						const chessStringOrStartPos =
							chessStringTrimmed.length > 0 ? chessStringTrimmed : ROOT_FEN;

						const { chess, format } = parseChessString(chessStringOrStartPos);

						const findComment = (
							fen: string,
						): { type: string; text: string | undefined }[] | null => {
							const comments = chess.getComments();
							for (let i = 0; i < comments.length; i++) {
								const c = comments[i];
								if (c.fen == fen) {
									return [{ type: 'text', text: c.comment }];
								}
							}
							return null;
						};

						const gameComment = (): JSONContent | null => {
							const cs = findComment(ROOT_FEN);
							if (Array.isArray(cs)) {
								if (cs.length > 0) {
									return cs[0];
								}
							}
							return null;
						};

						const fileContent: ChessStudyFileContent = {
							version: CURRENT_STORAGE_VERSION,
							headers: chess.getHeaders(),
							comment: gameComment(), // seems to return the last comment
							moves: chess.history({ verbose: true }).map((move) => ({
								...move,
								moveId: nanoid(),
								variants: [],
								shapes: [],
								comment: findComment(move.after),
								isCapture: () => {
									return move.isCapture();
								},
								isPromotion: () => {
									return move.isPromotion();
								},
								isEnPassant: () => {
									return move.isEnPassant();
								},
								isKingsideCastle: () => {
									return move.isKingsideCastle();
								},
								isQueensideCastle: () => {
									return move.isQueensideCastle();
								},
								isBigPawn: () => {
									return move.isBigPawn();
								},
								isNullMove: () => {
									return move.isNullMove();
								},
							})),
							rootFEN: format === 'FEN' ? chessStringOrStartPos : ROOT_FEN,
						};

						this.dataAdapter.createStorageFolderIfNotExists();

						const id = await this.dataAdapter.saveFile(fileContent);

						// TODO: It would be nice for the boardOrientation and viewComments to be in the UI as configuration options.
						editor.replaceRange(
							`\`\`\`chessStudy\nchessStudyId: ${id}\n${INITIAL_POSITION_YAML_NAME}: ${initialPosition}\n${CHESS_STUDY_KIND_YAML_NAME}: ${chessStudyKind}\nboardOrientation: ${boardOrientation}\ndisableCopy: ${disableCopy ? 'true' : 'false'}\ndisableNavigation: ${disableNavigation ? 'true' : 'false'}\nreadOnly: ${readOnly ? 'true' : 'false'}\nviewComments: ${viewComments ? 'true' : 'false'}\n\`\`\``,
							cursorPosition,
						);
					} catch (e) {
						new Notice(
							`Oops?? There was an error during PGN parsing. Cause: ${e}`,
							0,
						);
					}
				};

				new ChessStudyInsertModal(this.app, onSubmit).open();
			},
		});

		// Add chess study code block processor
		this.registerMarkdownCodeBlockProcessor(
			'chessStudy',
			async (source, el, ctx) => {
				const { chessStudyId } = parseUserConfig(this.settings, source);

				if (!chessStudyId.trim().length)
					return new Notice(
						"No chessStudyId parameter found, please add one manually if the file already exists or add it via the 'Insert PGN-Editor at cursor position' command.",
						0,
					);

				try {
					const data = await this.dataAdapter.loadFile(chessStudyId);

					ctx.addChild(
						new ChessStudyMarkdownRenderChild(
							el,
							source,
							this.app,
							this.settings,
							data,
							this.dataAdapter,
						),
					);
				} catch (e) {
					new Notice(
						`There was an error while trying to load ${chessStudyId}.json. You can check the plugin folder if the file exist and if not add one via the 'Insert PGN-Editor at cursor position' command.`,
						0,
					);
				}
			},
		);

		// console.lg('Chess Study Plugin successfully loaded');
	}

	/**
	 * @override
	 */
	async onunload(): Promise<void> {
		// console.lg('Chess Study Plugin successfully unloaded');
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
