import { describe, expect, test } from '@jest/globals';
import { compile_pgn_or_fen } from '../lib/chess-logic';
import { isFEN } from '../lib/fen-or-pgn';
import { ChessStudyFileContent } from '../lib/storage';
import { chess_study_to_pgn } from '../lib/storage/chess_study_to_pgn';

function simple(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "-"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('fen-or-pgn module', () => {
	test('isFEN', () => {
		expect(isFEN('8/R3P3/2Rk1K2/N7/2P5/8/8/8 b - - 3 2')).toBe(true);
		const chessStudy: ChessStudyFileContent = compile_pgn_or_fen(
			'8/R3P3/2Rk1K2/N7/2P5/8/8/8 b - - 3 2',
		);
		expect(chessStudy.version).toBe('0.0.2');
	});
});

describe('fen-or-pgn module', () => {
	test('isFEN', () => {
		const chessStudy: ChessStudyFileContent = compile_pgn_or_fen('1. e4');
		expect(chessStudy.version).toBe('0.0.2');
		const pgn = chess_study_to_pgn(chessStudy);

		expect(pgn).toBe(simple('1. e4 *'));
	});
});
