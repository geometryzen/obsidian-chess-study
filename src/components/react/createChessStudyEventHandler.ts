import { Chess as ChessPosition } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_MEMORIZE,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind';
import { GameChessStudyEventHandler } from './GameChessStudyEventHandler';
import { NoopChessStudyEventHandler } from './NoopChessStudyEventHandler';
import { PuzzleChessStudyEventHandler } from './PuzzleChessStudyEventHandler';
import { MemorizeChessStudyEventHandler } from './MemorizeChessStudyEventHandler';

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
