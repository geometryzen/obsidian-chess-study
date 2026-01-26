import { App, ButtonComponent, Modal, Setting } from 'obsidian';
import { ChessString } from 'src/main';

/**
 * The Modal Dialog that pops up when creating a new Chess Study.
 */
export class ChessStudyInsertModal extends Modal {
	chessString: ChessString;
	boardOrientation: 'white' | 'black' = 'white';
	#viewComments: boolean = false;

	onSubmit: (
		pgn: string,
		boardOrientation: 'white' | 'black',
		viewComments: boolean,
	) => void;

	constructor(
		app: App,
		onSubmit: (
			pgn: string,
			boardOrientation: 'white' | 'black',
			viewComments: boolean,
		) => void,
	) {
		super(app);
		this.onSubmit = onSubmit;
	}

	/**
	 * @override
	 */
	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl('h1', {
			text: 'Paste the full PGN/FEN (leave empty for a new game):',
		});

		new Setting(contentEl).setName('PGN/FEN').addTextArea((text) =>
			text
				.onChange((value) => {
					this.chessString = value;
				})
				.inputEl.setCssStyles({ width: '100%', height: '250px' }),
		);

		new Setting(contentEl).setName('boardOrientation').addDropdown((dropdown) => {
			dropdown.addOption('white', 'White');
			dropdown.addOption('black', 'Black');
			dropdown.setValue('white');
			dropdown.onChange((boardOrientation) => {
				this.boardOrientation =
					boardOrientation === 'white' ? boardOrientation : 'black';
			});
		});

		new Setting(contentEl).setName('viewComments').addToggle((toggle) => {
			toggle.setValue(false);
			toggle.setTooltip('Determines whether move comments are displayed', {});
			toggle.onChange((viewComments) => {
				this.#viewComments = viewComments;
			});
		});

		new Setting(contentEl).addButton((btn: ButtonComponent) =>
			btn
				.setButtonText('Submit')
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.chessString, this.boardOrientation, this.#viewComments);
				}),
		);
	}

	/**
	 * @override
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
