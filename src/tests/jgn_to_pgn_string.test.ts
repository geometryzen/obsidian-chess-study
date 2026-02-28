import { describe, expect, test } from '@jest/globals';
import { JgnStudy } from '../lib/jgn/JgnStudy';
import { jgn_to_pgn_string } from '../lib/jgn/jgn_to_pgn_string';

function simple(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('jgn_to_pgn_string', () => {
	test('isFEN', () => {
		const chessStudy: JgnStudy = {
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
		const pgn = jgn_to_pgn_string(chessStudy);

		expect(pgn).toBe(simple(' *'));
	});
});
