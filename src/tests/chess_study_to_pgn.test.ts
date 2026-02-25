import { describe, expect, test } from '@jest/globals';
import { ChessStudyFileContent } from '../lib/store/ChessStudyFileContent';
import { chess_study_to_pgn_string } from '../lib/store/chess_study_to_pgn_string';

function simple(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('fen-or-pgn module', () => {
	test('isFEN', () => {
		const chessStudy: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};
		chessStudy.headers['Event'] = '?';
		chessStudy.headers['Site'] = '?';
		chessStudy.headers['Date'] = '????.??.??';
		chessStudy.headers['Round'] = '?';
		chessStudy.headers['White'] = '?';
		chessStudy.headers['Black'] = '?';
		chessStudy.headers['Result'] = '*';
		const pgn = chess_study_to_pgn_string(chessStudy);

		expect(pgn).toBe(simple(' *'));
	});
});
