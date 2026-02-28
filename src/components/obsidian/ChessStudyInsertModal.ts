import {
	App,
	ButtonComponent,
	DropdownComponent,
	Modal,
	Setting,
	TextAreaComponent,
	ToggleComponent,
} from 'obsidian';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_YAML_NAME,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind';
import {
	INITIAL_POSITION_BEGIN,
	INITIAL_POSITION_END,
	INITIAL_POSITION_FIRST,
	INITIAL_POSITION_YAML_NAME,
	InitialPosition,
} from '../../lib/config/InitialPosition';
import { BoardOrientation, ChessString } from '../../main';

/**
 * The Modal Dialog that pops up when creating a new Chess Study.
 */
export class ChessStudyInsertModal extends Modal {
	#chessString: ChessString;
	#chessStudyKind: ChessStudyKind = CHESS_STUDY_KIND_GAME;
	#boardOrientation: BoardOrientation = 'white';
	#disableCopy = false;
	#disableNavigation = false;
	#initialPosition: InitialPosition = 'begin';
	#readOnly = false;
	#viewComments = true;

	onSubmit: (
		pgn: string,
		boardOrientation: BoardOrientation,
		disableCopy: boolean,
		disableNavigation: boolean,
		initialPosition: InitialPosition,
		readOnly: boolean,
		chessStudyKind: ChessStudyKind,
		viewComments: boolean,
	) => void;

	constructor(
		app: App,
		onSubmit: (
			pgn: string,
			boardOrientation: BoardOrientation,
			disableCopy: boolean,
			disableNavigation: boolean,
			initialPosition: InitialPosition,
			readOnly: boolean,
			chessStudyKind: ChessStudyKind,
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
			text: 'Insert Chess Study',
		});

		new Setting(contentEl)
			.setName('PGN/FEN')
			.addTextArea((text: TextAreaComponent) =>
				text
					.setValue('')
					.setPlaceholder('Paste PGN or FEN. Leave empty for a new game.')
					.onChange((value) => {
						this.#chessString = value;
					})
					.inputEl.setCssStyles({ width: '100%', height: '250px' }),
			);

		new Setting(contentEl)
			.setName('boardOrientation')
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption('white', 'White');
				dropdown.addOption('black', 'Black');
				dropdown.setValue(this.#boardOrientation);
				dropdown.onChange((boardOrientation) => {
					this.#boardOrientation =
						boardOrientation === 'white' ? boardOrientation : 'black';
				});
			});

		new Setting(contentEl)
			.setName('disableCopy')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#disableCopy);
				toggle.setTooltip('Determines whether the study can be copied', {});
				toggle.onChange((disableCopy) => {
					this.#disableCopy = disableCopy;
				});
			});

		new Setting(contentEl)
			.setName('disableNavigation')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#disableNavigation);
				toggle.setTooltip('Determines whether the study can be navigated', {});
				toggle.onChange((disableNavigation) => {
					this.#disableNavigation = disableNavigation;
				});
			});

		new Setting(contentEl)
			.setName(INITIAL_POSITION_YAML_NAME)
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption(INITIAL_POSITION_BEGIN, 'Begin');
				dropdown.addOption(INITIAL_POSITION_FIRST, 'First');
				dropdown.addOption(INITIAL_POSITION_END, 'End');
				dropdown.setValue(this.#initialPosition);
				dropdown.onChange((initialPosition) => {
					this.#initialPosition = initialPosition as InitialPosition;
				});
			});

		new Setting(contentEl)
			.setName('readOnly')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#readOnly);
				toggle.setTooltip('Determines whether the study can be changed', {});
				toggle.onChange((readOnly) => {
					this.#readOnly = readOnly;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize the YAML name.
			.setName(CHESS_STUDY_KIND_YAML_NAME)
			.addDropdown((dropdown: DropdownComponent) => {
				// TODO: Humanize the option display string
				dropdown.addOption(CHESS_STUDY_KIND_GAME, 'Game');
				dropdown.addOption(CHESS_STUDY_KIND_POSITION, 'Position');
				dropdown.addOption(CHESS_STUDY_KIND_PUZZLE, 'Puzzle');
				dropdown.addOption(CHESS_STUDY_KIND_LEGACY, 'Legacy');
				dropdown.setValue(this.#chessStudyKind);
				dropdown.onChange((type) => {
					this.#chessStudyKind = type as ChessStudyKind;
				});
			});

		new Setting(contentEl)
			.setName('viewComments')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#viewComments);
				toggle.setTooltip('Determines whether move comments are displayed', {});
				toggle.onChange((viewComments) => {
					this.#viewComments = viewComments;
				});
			});

		new Setting(contentEl).addButton((button: ButtonComponent) =>
			button
				.setButtonText('Submit')
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(
						this.#chessString,
						this.#boardOrientation,
						this.#disableCopy,
						this.#disableNavigation,
						this.#initialPosition,
						this.#readOnly,
						this.#chessStudyKind,
						this.#viewComments,
					);
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
