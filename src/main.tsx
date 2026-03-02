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
import { compile_pgn_or_fen } from './lib/chess-logic';
import { ROOT_FEN } from './lib/chess-logic/ROOT_FEN';
import {
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
	#dataAdapter: ChessStudyLoader;
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
		this.#dataAdapter = new ChessStudyLoader(
			this.app.vault.adapter,
			this.#studiesPath,
		);

		await this.#dataAdapter.createStudiesFolderIfNotExists();

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

						const fileContent: JgnStudy = compile_pgn_or_fen(chessStringOrStartPos);

						this.#dataAdapter.createStudiesFolderIfNotExists();

						const id = await this.#dataAdapter.saveFile(fileContent);

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
				const { chessStudyId } = parse_user_config(this.settings, source);

				if (!chessStudyId.trim().length)
					return new Notice(
						"No chessStudyId parameter found, please add one manually if the file already exists or add it via the 'Insert PGN-Editor at cursor position' command.",
						0,
					);

				try {
					const data = await this.#dataAdapter.loadFile(chessStudyId);

					ctx.addChild(
						new ChessStudyMarkdownRenderChild(
							el,
							source,
							this.app,
							this.settings,
							data,
							this.#dataAdapter,
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
