import { ChessStudyKind } from 'src/main';

export interface ControlProps {
	disableCopy: boolean;
	disableNavigation: boolean;
	readOnly: boolean;
	chessStudyKind: ChessStudyKind;
	onUndoButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onSaveButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSettingsButtonClick: () => void;
}
