import { describe, expect, test } from '@jest/globals';
import { compile_pgn_or_fen } from '../lib/chess-logic';
import { isFEN } from '../lib/fen-or-pgn';
import { ChessStudyFileContent } from '../lib/storage';
import { chess_study_to_pgn } from '../lib/storage/chess_study_to_pgn';

function simple_fen(fen: string, moves: string): string {
	// TODO: I don't think we need two New Lins
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n[SetUp "1"]\n[FEN "${fen}"]\n\n *`;
}

function simple_pgn(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('compile_pgn_or_fen', () => {
	test('should compile FEN', () => {
		expect(isFEN('8/R3P3/2Rk1K2/N7/2P5/8/8/8 b - - 3 2')).toBe(true);
		const fen = '8/R3P3/2Rk1K2/N7/2P5/8/8/8 b - - 3 2';
		const chessStudy: ChessStudyFileContent = compile_pgn_or_fen(fen);
		const pgn = chess_study_to_pgn(chessStudy);

		expect(pgn).toBe(simple_fen(fen, '*'));
	});
});

describe('compile_pgn_or_fen', () => {
	test('should compile PGN', () => {
		const chessStudy: ChessStudyFileContent = compile_pgn_or_fen('1. e4');
		expect(chessStudy.version).toBe('0.0.2');
		const pgn = chess_study_to_pgn(chessStudy);

		expect(pgn).toBe(simple_pgn('1. e4 *'));
	});
});
describe('compile_pgn_or_fen', () => {
	test('should export the game comment', () => {
		const chessStudy: ChessStudyFileContent = compile_pgn_or_fen('1. e4');
		chessStudy.comment = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a game commentary.',
						},
					],
				},
			],
		};
		expect(chessStudy.version).toBe('0.0.2');
		const pgn = chess_study_to_pgn(chessStudy);

		const expected = `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n{This is a game commentary.}\n1. e4 *`;

		expect(pgn).toBe(expected);
	});
});
