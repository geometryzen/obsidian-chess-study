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
	CHESS_STUDY_KIND_MEMORIZE,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_REPERTOIRE,
	CHESS_STUDY_KIND_YAML_NAME,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind';
import {
	COMPLETED_POSITION_END,
	COMPLETED_POSITION_YAML_NAME,
	CompletedPosition,
} from '../../lib/config/CompletedPosition';
import {
	INITIAL_POSITION_BEGIN,
	INITIAL_POSITION_END,
	INITIAL_POSITION_FIRST,
	INITIAL_POSITION_YAML_NAME,
	InitialPosition,
} from '../../lib/config/InitialPosition';
import { isFEN, isPGN } from '../../lib/fen-or-pgn';
import { compile_fen, compile_pgn } from '../../lib/parsing/compile_pgn_or_fen';
import { BoardOrientation, ChessString } from '../../main';

/**
 * The Modal Dialog that pops up when creating a new Chess Study.
 */
export class ChessStudyInsertModal extends Modal {
	#chessString: ChessString;
	#chessStudyKind: ChessStudyKind = CHESS_STUDY_KIND_PUZZLE;
	#boardOrientation: BoardOrientation = 'white';
	#disableCopy = false;
	#disableNavigation = false;
	#disableSave = false;
	#initialPosition: InitialPosition = INITIAL_POSITION_BEGIN;
	#completedPosition: CompletedPosition = COMPLETED_POSITION_END;
	#readOnly = false;
	#viewComments = true;

	private cboChessStudyKind: DropdownComponent;
	private cboBoardOrientation: DropdownComponent;

	onSubmit: (
		pgn: string,
		boardOrientation: BoardOrientation,
		disableCopy: boolean,
		disableNavigation: boolean,
		disableSave: boolean,
		initialPosition: InitialPosition,
		completedPosition: CompletedPosition,
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
			disableSave: boolean,
			initialPosition: InitialPosition,
			completedPosition: CompletedPosition,
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
			// TODO: Translation.
			text: 'Insert Chess Study',
		});

		new Setting(contentEl)
			// TODO: Translation.
			.setName('PGN/FEN')
			.addTextArea((text: TextAreaComponent) =>
				text
					.setValue('')
					.setPlaceholder('Paste PGN or FEN. Leave empty for a new game.')
					.onChange((value) => {
						if (isFEN(value)) {
							const study = compile_fen(value);
							this.cboChessStudyKind.setValue(CHESS_STUDY_KIND_PUZZLE);
							if (study.rootFEN.contains(' w ')) {
								this.cboBoardOrientation.setValue('white');
							} else if (study.rootFEN.contains(' b ')) {
								this.cboBoardOrientation.setValue('black');
							} else {
								// TODO
							}
						} else if (isPGN(value)) {
							const study = compile_pgn(value);
							this.cboChessStudyKind.setValue(CHESS_STUDY_KIND_GAME);
							if (study.rootFEN.contains(' w ')) {
								this.cboBoardOrientation.setValue('white');
							} else if (study.rootFEN.contains(' b ')) {
								this.cboBoardOrientation.setValue('black');
							} else {
								// TODO
							}
						} else {
							// TODO
						}
						this.#chessString = value;
					})
					.inputEl.setCssStyles({ width: '100%', height: '200px' }),
			);

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName(CHESS_STUDY_KIND_YAML_NAME)
			.addDropdown((cboChessStudyKind: DropdownComponent) => {
				this.cboChessStudyKind = cboChessStudyKind;
				// TODO: Humanize the option display string
				// TODO: Let's rationalize the options. Game and Puzzle would be most useful.
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_GAME, 'Game');
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_POSITION, 'Position');
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_PUZZLE, 'Puzzle');
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_REPERTOIRE, 'Repertoire');
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_LEGACY, 'Legacy');
				cboChessStudyKind.addOption(CHESS_STUDY_KIND_MEMORIZE, 'Memorize');
				cboChessStudyKind.setValue(this.#chessStudyKind);
				cboChessStudyKind.onChange((type) => {
					this.#chessStudyKind = type as ChessStudyKind;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName('boardOrientation')
			.addDropdown((cboBoardOrientation: DropdownComponent) => {
				this.cboBoardOrientation = cboBoardOrientation;
				cboBoardOrientation.addOption('white', 'White');
				cboBoardOrientation.addOption('black', 'Black');
				cboBoardOrientation.setValue(this.#boardOrientation);
				cboBoardOrientation.onChange((boardOrientation) => {
					this.#boardOrientation =
						boardOrientation === 'white' ? boardOrientation : 'black';
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName('disableCopy')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#disableCopy);
				toggle.setTooltip('Determines whether the study can be copied', {});
				toggle.onChange((disableCopy) => {
					this.#disableCopy = disableCopy;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName('disableNavigation')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#disableNavigation);
				toggle.setTooltip('Determines whether the study can be navigated', {});
				toggle.onChange((disableNavigation) => {
					this.#disableNavigation = disableNavigation;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName('disableSave')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#disableSave);
				toggle.setTooltip('Determines whether the study can be saved', {});
				toggle.onChange((disableSave) => {
					this.#disableSave = disableSave;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
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
			// TODO: Humanize/Translation the YAML name.
			.setName(COMPLETED_POSITION_YAML_NAME)
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption(COMPLETED_POSITION_END, 'End');
				dropdown.setValue(this.#completedPosition);
				dropdown.onChange((completedPosition) => {
					this.#initialPosition = completedPosition as InitialPosition;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
			.setName('readOnly')
			.addToggle((toggle: ToggleComponent) => {
				toggle.setValue(this.#readOnly);
				toggle.setTooltip('Determines whether the study can be changed', {});
				toggle.onChange((readOnly) => {
					this.#readOnly = readOnly;
				});
			});

		new Setting(contentEl)
			// TODO: Humanize/Translation the YAML name.
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
				// TODO: Translation.
				.setButtonText('Submit')
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(
						this.#chessString,
						this.#boardOrientation,
						this.#disableCopy,
						this.#disableNavigation,
						this.#disableSave,
						this.#initialPosition,
						this.#completedPosition,
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
