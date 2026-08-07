import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { NeoStudy } from '../lib/neo/NeoStudy';
import { jgn_from_neo } from '../lib/transform/jgn_from_neo';
import { JgnStudy } from '../lib/jgn/JgnStudy';
import { jgn_to_pgn_string } from '../lib/jgn/jgn_to_pgn_string';
import { ensure_target_moves } from '../lib/neo/ensure_target_moves';
import { NeoMove } from '../lib/neo/NeoMove';
import { compile_pgn_or_fen } from '../lib/parsing/compile_pgn_or_fen';
import { neo_from_jgn } from '../lib/transform/neo_from_jgn';

function simple_pgn(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('ensure_target_move', () => {
	test('noop', () => {
		const headers: Record<string, string> = {};
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			null,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			null,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n *',
		);
	});
	test('root', () => {
		const headers: Record<string, string> = {};
		const source_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			source_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			null,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);
	});
	test('root missing in target study', () => {
		const headers: Record<string, string> = {};
		const source_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			source_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			null,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);
	});
	test('root same in target study', () => {
		const headers: Record<string, string> = {};
		const source_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			source_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const target_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			target_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);
	});
	test('root differs in target study', () => {
		// For the time being I am not going to change the root if there is a conflict.
		const headers: Record<string, string> = {};
		const source_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			source_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const target_d4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'd2', // from
			nanoid(),
			[],
			'q',
			'd4', // san
			[],
			'd4', // to
			null,
			null,
		);
		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			target_d4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. d4 *',
		);
	});
	test('001', () => {
		// For the time being I am not going to change the root if there is a conflict.
		const headers: Record<string, string> = {};
		const source_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const source_e6 = new NeoMove(
			'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			undefined,
			'b',
			null,
			undefined,
			'e7', // from
			nanoid(),
			[],
			'q',
			'e6', // san
			[],
			'e6', // to
			null,
			null,
		);
		source_e4_root.left = source_e6;
		const sourceStudy = new NeoStudy(
			null,
			[],
			headers,
			source_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const target_e4_root = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			undefined,
			'w',
			null,
			undefined,
			'e2', // from
			nanoid(),
			[],
			'q',
			'e4', // san
			[],
			'e4', // to
			null,
			null,
		);
		const targetStudy = new NeoStudy(
			null,
			[],
			headers,
			target_e4_root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 1... e6 *',
		);

		expect(targetPgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 1... e6 *',
		);
	});
	test('002 - adding a next move', () => {
		const sourceStudy = neo_from_jgn(compile_pgn_or_fen('1. e4 e6'));
		const targetStudy = neo_from_jgn(compile_pgn_or_fen('1. e4'));

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(simple_pgn('1. e4 1... e6 *'));
		expect(targetPgn).toBe(simple_pgn('1. e4 1... e6 *'));
	});
	test('003 -- adding several next moves', () => {
		const sourceStudy = neo_from_jgn(
			compile_pgn_or_fen('1. e4 e6 2. d4 d5 3. e5'),
		);
		const targetStudy = neo_from_jgn(compile_pgn_or_fen('1. e4'));

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(simple_pgn('1. e4 1... e6 2. d4 2... d5 3. e5 *'));
		expect(targetPgn).toBe(simple_pgn('1. e4 1... e6 2. d4 2... d5 3. e5 *'));
	});
	test('004 - adding a variation', () => {
		const sourceStudy = neo_from_jgn(
			compile_pgn_or_fen('1. e4 e6 2. d4 d5 3. f3'),
		);
		const targetStudy = neo_from_jgn(
			compile_pgn_or_fen('1. e4 e6 2. d4 d5 3. e5'),
		);

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(simple_pgn('1. e4 1... e6 2. d4 2... d5 3. f3 *'));
		expect(targetPgn).toBe(
			simple_pgn('1. e4 1... e6 2. d4 2... d5 3. e5 (3. f3) *'),
		);
	});
	test('005 - adding a variations', () => {
		const sourceStudy = neo_from_jgn(
			compile_pgn_or_fen('1. e4 1... e6 (1... c6 2. d4) *'),
		);
		const targetStudy = neo_from_jgn(compile_pgn_or_fen('1. e4 *'));

		ensure_target_moves(sourceStudy, targetStudy);

		const sourceJgn: JgnStudy = jgn_from_neo(sourceStudy);
		const sourcePgn = jgn_to_pgn_string(sourceJgn);

		const targetJgn: JgnStudy = jgn_from_neo(targetStudy);
		const targetPgn = jgn_to_pgn_string(targetJgn);

		expect(sourcePgn).toBe(simple_pgn('1. e4 1... e6 (1... c6 2. d4) *'));
		expect(targetPgn).toBe(simple_pgn('1. e4 1... e6 (1... c6 2. d4) *'));
	});
});
/*
[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "?"]
[Black "?"]
[Result "*"]

1. e4 1... e6 (1... c6 2. d4) *
*/
