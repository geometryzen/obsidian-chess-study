import { ChessStudyMove } from '../../lib/store';
import { ControlProps } from './ControlsProps';

/**
 * Notice that by design, the PgnViewerProps extends ControlProps to pass the properties through.
 */
export interface PgnViewerProps extends ControlProps {
	history: ChessStudyMove[];
	currentMoveId: string | null;
	/**
	 * The player to move in the initial position.
	 */
	initialPlayer: 'w' | 'b';
	/**
	 * The move number in the initial position.
	 */
	initialMoveNumber: number;
	isVisible: boolean;
	onMoveItemClick: (moveId: string) => void;
}
