import { App, PluginSettingTab, Setting } from 'obsidian';
import ChessStudyPlugin from 'src/main';

export interface ChessStudyPluginSettings {
	boardOrientation: 'white' | 'black';
	boardColor: 'green' | 'brown';
	disableNavigation: true | false;
	readOnly: true | false;
	viewComments: true | false;
}

export const DEFAULT_SETTINGS: ChessStudyPluginSettings = {
	boardOrientation: 'white',
	boardColor: 'green',
	disableNavigation: false,
	readOnly: false,
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
						this.#plugin.settings.boardOrientation = orientation as 'white' | 'black';
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
						this.#plugin.settings.boardColor = boardColor as 'green' | 'brown';
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
