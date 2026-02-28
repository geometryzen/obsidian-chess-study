import { CHESS_STUDY_KIND_GAME } from '../../lib/config/ChessStudyKind';
import { INITIAL_POSITION_BEGIN } from '../../lib/config/InitialPosition';
import { ChessStudyPluginSettings } from './ChessStudyPluginSettings';

/**
 * The values used when there is no corresponding setting.
 */
export const DEFAULT_CHESS_STUDY_PLUGIN_SETTINGS: ChessStudyPluginSettings = {
	boardOrientation: 'white',
	boardColor: 'brown',
	disableCopy: false,
	disableNavigation: false,
	initialPosition: INITIAL_POSITION_BEGIN,
	readOnly: false,
	chessStudyKind: CHESS_STUDY_KIND_GAME,
	viewComments: true,
};
