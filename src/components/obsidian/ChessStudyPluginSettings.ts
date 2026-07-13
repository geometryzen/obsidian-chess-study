import { ChessStudyKind } from '../../lib/config/ChessStudyKind';
import { CompletedPosition } from '../../lib/config/CompletedPosition';
import { InitialPosition } from '../../lib/config/InitialPosition';
import { BoardColor, BoardOrientation } from '../../main';

/**
 * Everything in the chessStudy YAML block except the chessStudId
 */
export interface ChessStudyPluginSettings {
	repertoireId?: string;
	boardOrientation: BoardOrientation;
	boardColor: BoardColor;
	chessStudyKind: ChessStudyKind;
	disableCopy: true | false;
	disableNavigation: true | false;
	disableSave: true | false;
	initialPosition: InitialPosition;
	completedPosition: CompletedPosition;
	readOnly: true | false;
	viewComments: true | false;
}
