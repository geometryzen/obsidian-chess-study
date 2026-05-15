import { Chess as ChessPosition } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_MEMORIZE,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_REPERTOIRE,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind.js';
import { GameChessStudyEventHandler } from './GameChessStudyEventHandler.js';
import { NoopChessStudyEventHandler } from './NoopChessStudyEventHandler.js';
import { PuzzleChessStudyEventHandler } from './PuzzleChessStudyEventHandler.js';
import { MemorizeChessStudyEventHandler } from './MemorizeChessStudyEventHandler.js';
import { RepertoireChessStudyEventHandler } from './RepertoireChessStudyEventHandler.js';

export const createChessStudyEventHandler = (
	chessStudyKind: ChessStudyKind,
	chessView: ChessView | null,
	chessLogic: ChessPosition,
	setChessLogic: React.Dispatch<React.SetStateAction<ChessPosition>>,
) => {
	switch (chessStudyKind) {
		case CHESS_STUDY_KIND_GAME: {
			return new GameChessStudyEventHandler(chessView, setChessLogic);
		}
		case CHESS_STUDY_KIND_PUZZLE: {
			return new PuzzleChessStudyEventHandler(
				chessView,
				chessLogic,
				setChessLogic,
			);
		}
		case CHESS_STUDY_KIND_POSITION: {
			return new NoopChessStudyEventHandler();
		}
		case CHESS_STUDY_KIND_LEGACY: {
			return new GameChessStudyEventHandler(chessView, setChessLogic);
		}
		case CHESS_STUDY_KIND_REPERTOIRE: {
			return new RepertoireChessStudyEventHandler(chessView, setChessLogic);
		}
		case CHESS_STUDY_KIND_MEMORIZE: {
			return new MemorizeChessStudyEventHandler(
				chessView,
				chessLogic,
				setChessLogic,
			);
		}
		default: {
			return new NoopChessStudyEventHandler();
		}
	}
};
