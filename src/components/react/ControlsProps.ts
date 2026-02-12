import { ChessStudyKind } from 'src/main';

export interface ControlProps {
	disableCopy: boolean;
	disableNavigation: boolean;
	readOnly: boolean;
	chessStudyKind: ChessStudyKind;
	onBeginButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onEndButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSaveButtonClick: () => void;
	onDeleteButtonClick: () => void;
	onAnnotateMoveCorrect: () => void;
	onAnnotateMoveInaccurate: () => void;
	onAnnotateMoveMistake: () => void;
	onAnnotateMoveBlunder: () => void;
	onIncreasePositionEvaluation: () => void;
	onDecreasePositionEvaluation: () => void;
	onSettingsButtonClick: () => void;
}
