import { JgnMove } from '../../lib/jgn/JgnMove';
import { ControlProps } from './ControlsProps';

/**
 * Notice that by design, the PgnViewerProps extends ControlProps to pass the properties through.
 */
export interface JgnMovesViewerProps extends ControlProps {
	jgnMoves: JgnMove[];
	// neoMoves: NeoMove | null;
	currentMoveId: string | null;
	/**
	 * The player to move in the initial position.
	 */
	initialPlayer: 'w' | 'b';
	/**
	 * The move number or the root position.
	 */
	rootMoveNumber: number;
	isVisible: boolean;
	onMoveItemClick: (moveId: string) => void;
}
