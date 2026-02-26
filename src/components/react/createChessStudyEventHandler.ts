import { Chess as ChessJs } from 'chess.js';
import { Api as ChessView } from 'chessground/api';
import { ChessStudyKind } from '../../main';
import { GameChessStudyEventHandler } from './GameChessStudyEventHandler';
import { NoopChessStudyEventHandler } from './NoopChessStudyEventHandler';
import { PuzzleChessStudyEventHandler } from './PuzzleChessStudyEventHandler';

export const createChessStudyEventHandler = (
	chessStudyKind: ChessStudyKind,
	chessView: ChessView | null,
	setChessLogic: React.Dispatch<React.SetStateAction<ChessJs>>,
) => {
	switch (chessStudyKind) {
		case 'game': {
			return new GameChessStudyEventHandler(chessView, setChessLogic);
		}
		case 'puzzle': {
			return new PuzzleChessStudyEventHandler(chessView, setChessLogic);
		}
		case 'position': {
			return new NoopChessStudyEventHandler();
		}
		case 'legacy': {
			return new GameChessStudyEventHandler(chessView, setChessLogic);
		}
		default: {
			return new NoopChessStudyEventHandler();
		}
	}
};
