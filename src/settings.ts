import { ChessStudyKind } from './lib/config/ChessStudyKind';
import { CompletedPosition } from './lib/config/CompletedPosition';
import { InitialPosition } from './lib/config/InitialPosition';

export type BoardOrientation = 'white' | 'black';

export const BOARD_COLORS = {
	blue: 'Blue',
	'blue-soft': 'Blue (soft)',
	green: 'Green',
	brown: 'Brown',
} as const;

export type BoardColor = keyof typeof BOARD_COLORS;

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
	showEvaluation: true | false;
	viewComments: true | false;
}
