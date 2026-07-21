import { NeoMove } from '../../lib/neo/NeoMove';
import { NeoStudy } from '../../lib/neo/NeoStudy';

export interface GameState {
	/**
	 * The current move in the chessStudy property.
	 */
	currentChessStudyMove: NeoMove | null;
	/**
	 * The current move in the repertoire property.
	 */
	currentRepertoireMove: NeoMove | null;
	/**
	 *
	 */
	chessStudy: NeoStudy;
	/**
	 *
	 */
	repertoire: NeoStudy | null;
	/**
	 * Determines whether the comments are visible or not.
	 */
	isCommentsHidden: boolean;
	/**
	 * Determines whether the move navigation buttons are visible.
	 */
	isNavigationHidden: boolean;
	/**
	 * Determines whether the notation is visible or not.
	 */
	isNotationHidden: boolean;
	/**
	 * Determines whether the Board View has mouse or pointer interaction.
	 */
	isViewOnly: boolean;
}
