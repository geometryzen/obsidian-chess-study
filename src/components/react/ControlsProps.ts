export interface ControlProps {
	readOnly: boolean;
	onUndoButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onSaveButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSettingsButtonClick: () => void;
}
