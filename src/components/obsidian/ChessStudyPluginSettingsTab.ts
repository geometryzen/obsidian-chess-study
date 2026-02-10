import { App, PluginSettingTab, Setting } from 'obsidian';
import ChessStudyPlugin, {
	BoardColor,
	BoardOrientation,
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_YAML_NAME,
	ChessStudyKind,
	INITIAL_POSITION_BEGIN,
	INITIAL_POSITION_END,
	INITIAL_POSITION_FIRST,
	INITIAL_POSITION_YAML_NAME,
	InitialPosition,
} from 'src/main';
import { ChessStudyPluginSettings } from './ChessStudyPluginSettings';

export const DEFAULT_SETTINGS: ChessStudyPluginSettings = {
	boardOrientation: 'white',
	boardColor: 'brown',
	disableCopy: false,
	disableNavigation: false,
	initialPosition: INITIAL_POSITION_BEGIN,
	readOnly: false,
	chessStudyKind: CHESS_STUDY_KIND_GAME,
	viewComments: true,
};

export class ChessStudyPluginSettingsTab extends PluginSettingTab {
	#plugin: ChessStudyPlugin;

	constructor(app: App, plugin: ChessStudyPlugin) {
		super(app, plugin);
		this.#plugin = plugin;
	}

	/**
	 * @override
	 */
	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Board orientation')
			.setDesc('Sets the default orientation of the board')
			.addDropdown((dropdown) => {
				dropdown.addOption('white', 'White');
				dropdown.addOption('black', 'Black');

				dropdown
					.setValue(this.#plugin.settings.boardOrientation)
					.onChange((orientation) => {
						this.#plugin.settings.boardOrientation = orientation as BoardOrientation;
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Board color')
			.setDesc('Sets the default color of the board')
			.addDropdown((dropdown) => {
				dropdown.addOption('green', 'Green');
				dropdown.addOption('brown', 'Brown');

				dropdown
					.setValue(this.#plugin.settings.boardColor)
					.onChange((boardColor) => {
						this.#plugin.settings.boardColor = boardColor as BoardColor;
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Disable Copy')
			.setDesc('Sets the default value of the disableCopy property')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.disableCopy.toString())
					.onChange((disableCopy) => {
						this.#plugin.settings.disableCopy = disableCopy === 'true';
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Disable Navigation')
			.setDesc('Sets the default value of the disableNavigation property')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.disableNavigation.toString())
					.onChange((disableNavigation) => {
						this.#plugin.settings.disableNavigation = disableNavigation === 'true';
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(INITIAL_POSITION_YAML_NAME)
			.setDesc(
				`Sets the default value of the ${INITIAL_POSITION_YAML_NAME} property`,
			)
			.addDropdown((dropdown) => {
				dropdown.addOption(INITIAL_POSITION_END, 'End');
				dropdown.addOption(INITIAL_POSITION_FIRST, 'First');
				dropdown.addOption(INITIAL_POSITION_END, 'End');
				dropdown
					.setValue(this.#plugin.settings.initialPosition)
					.onChange((initialPosition) => {
						this.#plugin.settings.initialPosition =
							initialPosition as InitialPosition;
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Read Only')
			.setDesc('Sets the default value of the readOnly property')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.readOnly.toString())
					.onChange((readOnly) => {
						this.#plugin.settings.readOnly = readOnly === 'true';
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			// TODO: Humanize
			.setName(CHESS_STUDY_KIND_YAML_NAME)
			.setDesc(
				`Sets the default value of the ${CHESS_STUDY_KIND_YAML_NAME} property`,
			)
			.addDropdown((dropdown) => {
				dropdown.addOption(CHESS_STUDY_KIND_GAME, 'Game');
				dropdown.addOption(CHESS_STUDY_KIND_POSITION, 'Position');
				dropdown.addOption(CHESS_STUDY_KIND_PUZZLE, 'Puzzle');
				dropdown.addOption(CHESS_STUDY_KIND_LEGACY, 'Legacy');
				dropdown
					.setValue(this.#plugin.settings.chessStudyKind)
					.onChange((chessStudyKind) => {
						this.#plugin.settings.chessStudyKind = chessStudyKind as ChessStudyKind;
						this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('View Comments')
			.setDesc('Sets the default view of the comments')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.viewComments.toString())
					.onChange((viewComments) => {
						this.#plugin.settings.viewComments = viewComments === 'true';
						this.#plugin.saveSettings();
					});
			});
	}
}
