import { NeoStudy } from '../../lib/neo/NeoStudy';
import { ControlProps } from './ControlsProps';

/**
 * Notice that by design, the PgnViewerProps extends ControlProps to pass the properties through.
 */
export interface NeoMovesViewerProps extends ControlProps {
	study: NeoStudy;
	/**
	 *
	 */
	currentMoveId: string | null;
	/**
	 * The player to move in the initial position.
	 */
	initialPlayer: 'w' | 'b';
	/**
	 * The move number in the initial position.
	 */
	rootMoveNumber: number;
	isVisible: boolean;
	onMoveItemClick: (moveId: string) => void;
}
