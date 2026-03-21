import { Editor, Notice, Plugin, normalizePath } from 'obsidian';
import { ChessStudyInsertModal } from './components/obsidian/ChessStudyInsertModal';
import { ChessStudyMarkdownRenderChild } from './components/obsidian/ChessStudyMarkdownRenderChild';
import { ChessStudyPluginSettingsTab } from './components/obsidian/ChessStudyPluginSettingsTab';

// these styles must be imported somewhere
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import '../assets/board/green.css';
import { ChessStudyPluginSettings } from './components/obsidian/ChessStudyPluginSettings';
import { DEFAULT_CHESS_STUDY_PLUGIN_SETTINGS } from './components/obsidian/DEFAULT_CHESS_STUDY_PLUGIN_SETTINGS';
import { compile_pgn_or_fen } from './lib/parsing/compile_pgn_or_fen';
import { ROOT_FEN } from './lib/chess-logic/ROOT_FEN';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_YAML_NAME,
	ChessStudyKind,
} from './lib/config/ChessStudyKind';
import {
	INITIAL_POSITION_YAML_NAME,
	InitialPosition,
} from './lib/config/InitialPosition';
import { JgnStudy } from './lib/jgn/JgnStudy';
import { ChessStudyLoader } from './lib/obsidian/ChessStudyLoader';
import { parse_user_config } from './lib/obsidian/parse_user_config';
import './main.css';
import { NeoStudy } from './lib/neo/NeoStudy';

type FEN = string;
type PGN = string;
export type ChessString = FEN | PGN;
export type BoardOrientation = 'white' | 'black';
export type BoardColor = 'green' | 'brown';

// TODO:
// 1) Allow to show the root position
// 2) Display correct move after removing the last move

export default class ChessStudyPlugin extends Plugin {
	settings: ChessStudyPluginSettings;
	#studyLoader: ChessStudyLoader;
	readonly #studiesPath = normalizePath(
		`${this.app.vault.configDir}/plugins/${this.manifest.id}/studies/`,
	);

	/**
	 * @override
	 */
	async onload(): Promise<void> {
		// Load Settings
		await this.loadSettings();

		// Register Data Adapter
		this.#studyLoader = new ChessStudyLoader(
			this.app.vault.adapter,
			this.#studiesPath,
		);

		await this.#studyLoader.createStudiesFolderIfNotExists();

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
					disableSave: boolean,
					initialPosition: InitialPosition,
					readOnly: boolean,
					chessStudyKind: ChessStudyKind,
					viewComments: boolean,
				) => {
					try {
						const chessStringTrimmed = chessString?.trim() ?? '';
						const chessStringOrStartPos =
							chessStringTrimmed.length > 0 ? chessStringTrimmed : ROOT_FEN;

						const jgnStudy: JgnStudy = compile_pgn_or_fen(chessStringOrStartPos);

						this.#studyLoader.createStudiesFolderIfNotExists();

						const id = await this.#studyLoader.saveJgnStudy(jgnStudy);

						const BACKTICKS = '```';
						const parts: string[] = [];
						switch (chessStudyKind) {
							case 'puzzle': {
								// The first instance of the chess study is the puzzle.
								parts.push(`${BACKTICKS}chessStudy`);
								parts.push(`chessStudyId: ${id}`);
								parts.push(`${INITIAL_POSITION_YAML_NAME}: ${initialPosition}`);
								parts.push(`${CHESS_STUDY_KIND_YAML_NAME}: ${CHESS_STUDY_KIND_PUZZLE}`);
								parts.push(`boardOrientation: ${boardOrientation}`);
								parts.push('disableCopy: true');
								parts.push('disableNavigation: true');
								parts.push('disableSave: true');
								parts.push(`readOnly: true`);
								parts.push(`viewComments: false`);
								parts.push(BACKTICKS);
								// Using spaced repetition Question Mark as separator.
								parts.push('?');
								// The second instance of the chess study is the solution, which is fully editable.
								parts.push(`${BACKTICKS}chessStudy`);
								parts.push(`chessStudyId: ${id}`);
								parts.push(`${INITIAL_POSITION_YAML_NAME}: ${initialPosition}`);
								parts.push(`${CHESS_STUDY_KIND_YAML_NAME}: ${CHESS_STUDY_KIND_GAME}`);
								parts.push(`boardOrientation: ${boardOrientation}`);
								parts.push(`disableCopy: false`);
								parts.push(`disableNavigation: false`);
								parts.push(`disableSave: false`);
								parts.push(`readOnly: false`);
								parts.push(`viewComments: true`);
								parts.push(BACKTICKS);
								break;
							}
							default: {
								parts.push(`${BACKTICKS}chessStudy`);
								parts.push(`chessStudyId: ${id}`);
								parts.push(`${INITIAL_POSITION_YAML_NAME}: ${initialPosition}`);
								parts.push(`${CHESS_STUDY_KIND_YAML_NAME}: ${chessStudyKind}`);
								parts.push(`boardOrientation: ${boardOrientation}`);
								parts.push(`disableCopy: ${disableCopy ? 'true' : 'false'}`);
								parts.push(
									`disableNavigation: ${disableNavigation ? 'true' : 'false'}`,
								);
								parts.push(`disableSave: ${disableSave ? 'true' : 'false'}`);
								parts.push(`readOnly: ${readOnly ? 'true' : 'false'}`);
								parts.push(`viewComments: ${viewComments ? 'true' : 'false'}`);
								parts.push(BACKTICKS);
							}
						}
						editor.replaceRange(parts.join('\n'), cursorPosition);
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
				const { chessStudyId } = parse_user_config(this.settings, source);

				if (!chessStudyId.trim().length)
					return new Notice(
						"No chessStudyId parameter found, please add one manually if the file already exists or add it via the 'Insert PGN-Editor at cursor position' command.",
						0,
					);

				try {
					const neoStudy: NeoStudy =
						await this.#studyLoader.loadNeoStudy(chessStudyId);

					ctx.addChild(
						new ChessStudyMarkdownRenderChild(
							el,
							source,
							this.app,
							this.settings,
							neoStudy,
							this.#studyLoader,
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
		this.settings = Object.assign(
			{},
			DEFAULT_CHESS_STUDY_PLUGIN_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
