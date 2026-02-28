import { ChessStudyKind } from '../../lib/config/ChessStudyKind';
import { InitialPosition } from '../../lib/config/InitialPosition';
import { BoardColor, BoardOrientation } from '../../main';

/**
 * Everything in the chessStudy YAML block except the chessStudId
 */
export interface ChessStudyPluginSettings {
	boardOrientation: BoardOrientation;
	boardColor: BoardColor;
	chessStudyKind: ChessStudyKind;
	disableCopy: true | false;
	disableNavigation: true | false;
	initialPosition: InitialPosition;
	readOnly: true | false;
	viewComments: true | false;
}
