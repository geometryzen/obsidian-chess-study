import { ChessStudyKind } from '../../lib/config/ChessStudyKind';

export interface ControlProps {
	disableCopy: boolean;
	disableNavigation: boolean;
	disableSave: boolean;
	readOnly: boolean;
	chessStudyKind: ChessStudyKind;
	currentMoveId: string | null;
	onBeginButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onEndButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSaveButtonClick: () => void;
	onDeleteButtonClick: (moveId: string) => void;
	onAnnotateMoveCorrect: () => void;
	onAnnotateMoveInaccurate: () => void;
	onAnnotateMoveMistake: () => void;
	onAnnotateMoveBlunder: () => void;
	onIncreaseMoveAnnotation: () => void;
	onDecreaseMoveAnnotation: () => void;
	onIncreasePositionEvaluation: () => void;
	onDecreasePositionEvaluation: () => void;
	onSettingsButtonClick: () => void;
	onSearchDatabase: () => void;
	onPromoteLine: () => void;
	onDemoteLine: () => void;
}
