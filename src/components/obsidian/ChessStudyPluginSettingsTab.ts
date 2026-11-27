import { App, PluginSettingTab, Setting } from 'obsidian';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_MEMORIZE,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_REPERTOIRE,
	CHESS_STUDY_KIND_YAML_NAME,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind';
import {
	INITIAL_POSITION_END,
	INITIAL_POSITION_FIRST,
	INITIAL_POSITION_YAML_NAME,
} from '../../lib/config/InitialPosition';
import ChessStudyPlugin, { BoardColor, BoardOrientation } from '../../main';
import {
	COMPLETED_POSITION_END,
	COMPLETED_POSITION_YAML_NAME,
} from '../../lib/config/CompletedPosition';

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
					.onChange(async (orientation) => {
						this.#plugin.settings.boardOrientation = orientation as BoardOrientation;
						await this.#plugin.saveSettings();
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
					.onChange(async (boardColor) => {
						this.#plugin.settings.boardColor = boardColor as BoardColor;
						await this.#plugin.saveSettings();
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
					.onChange(async (disableCopy) => {
						this.#plugin.settings.disableCopy = disableCopy === 'true';
						await this.#plugin.saveSettings();
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
					.onChange(async (disableNavigation) => {
						this.#plugin.settings.disableNavigation = disableNavigation === 'true';
						await this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Show Evaluation')
			.setDesc('Sets the default value of the showEvaluation property')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.showEvaluation.toString())
					.onChange(async (showEvaluation) => {
						this.#plugin.settings.showEvaluation = showEvaluation === 'true';
						await this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Disable Save')
			.setDesc('Sets the default value of the disableSave property')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.#plugin.settings.disableSave.toString())
					.onChange(async (disableSave) => {
						this.#plugin.settings.disableSave = disableSave === 'true';
						await this.#plugin.saveSettings();
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
					.onChange(async (initialPosition) => {
						this.#plugin.settings.initialPosition = initialPosition;
						await this.#plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName(COMPLETED_POSITION_YAML_NAME)
			.setDesc(
				`Sets the default value of the ${COMPLETED_POSITION_YAML_NAME} property`,
			)
			.addDropdown((dropdown) => {
				dropdown.addOption(COMPLETED_POSITION_END, 'End');
				dropdown
					.setValue(this.#plugin.settings.completedPosition)
					.onChange(async (completedPosition) => {
						this.#plugin.settings.completedPosition = completedPosition;
						await this.#plugin.saveSettings();
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
					.onChange(async (readOnly) => {
						this.#plugin.settings.readOnly = readOnly === 'true';
						await this.#plugin.saveSettings();
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
				dropdown.addOption(CHESS_STUDY_KIND_REPERTOIRE, 'Repertoire');
				dropdown.addOption(CHESS_STUDY_KIND_LEGACY, 'Legacy');
				dropdown.addOption(CHESS_STUDY_KIND_MEMORIZE, 'Memorize');
				dropdown
					.setValue(this.#plugin.settings.chessStudyKind)
					.onChange(async (chessStudyKind) => {
						this.#plugin.settings.chessStudyKind = chessStudyKind as ChessStudyKind;
						await this.#plugin.saveSettings();
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
					.onChange(async (viewComments) => {
						this.#plugin.settings.viewComments = viewComments === 'true';
						await this.#plugin.saveSettings();
					});
			});
	}
}
