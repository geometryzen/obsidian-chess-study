import { ChessStudyMove } from 'src/lib/storage';
import { ControlProps } from './ControlsProps';

/**
 * Notice that by design, the PgnViewerProps extends ControlProps to pass the properties through.
 */
export interface PgnViewerProps extends ControlProps {
	history: ChessStudyMove[];
	currentMoveId: string | null;
	initialPlayer: 'w' | 'b';
	initialMoveNumber: number;
	onMoveItemClick: (moveId: string) => void;
	/*
	onUndoButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onSaveButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSettingsButtonClick: () => void;
	*/
}
