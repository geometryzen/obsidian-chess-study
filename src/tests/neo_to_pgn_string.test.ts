import { describe, expect, test } from '@jest/globals';
import { JgnStudy } from '../lib/jgn/JgnStudy';
import { jgn_to_pgn_string } from '../lib/jgn/jgn_to_pgn_string';
import { nanoid } from 'nanoid';
import { NumericAnnotationGlyph } from '../lib/NumericAnnotationGlyphs';
import { DrawShape } from 'chessground/draw';
import { NeoMove } from '../lib/neo/NeoMove';
import { NeoStudy } from '../lib/neo/NeoStudy';
import { jgn_from_neo } from '../lib/transform/jgn_from_neo';

function simple(moves: string): string {
	return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moves}`;
}

describe('neo_to_pgn_string', () => {
	test('isFEN', () => {
		const chessStudy: JgnStudy = {
			headers: {},
			comment: null,
			shapes: [],
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
	test('1. e4', () => {
		const headers: Record<string, string> = {};
		headers['Event'] = '?';
		headers['Site'] = '?';
		headers['Date'] = '????.??.??';
		headers['Round'] = '?';
		headers['White'] = '?';
		headers['Black'] = '?';
		headers['Result'] = '*';

		const after = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const clock: string | undefined = void 0;
		const color = 'w';
		const comment = null;
		const evaluation: number | undefined = void 0;
		const from = 'e2';
		const id = nanoid();
		const nags: NumericAnnotationGlyph[] = [];
		const promotion = 'q';
		const san = 'e4';
		const shapes: DrawShape[] = [];
		const to = 'e4';
		const left: NeoMove | null = null;
		const right: NeoMove | null = null;
		const root = new NeoMove(
			after,
			clock,
			color,
			comment,
			evaluation,
			from,
			id,
			nags,
			promotion,
			san,
			shapes,
			to,
			left,
			right,
		);

		const model = new NeoStudy(
			null,
			[],
			headers,
			root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const jgn: JgnStudy = jgn_from_neo(model);

		const pgn = jgn_to_pgn_string(jgn);

		expect(pgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *',
		);
	});
	test('1. e4 e5', () => {
		const headers: Record<string, string> = {};
		headers['Event'] = '?';
		headers['Site'] = '?';
		headers['Date'] = '????.??.??';
		headers['Round'] = '?';
		headers['White'] = '?';
		headers['Black'] = '?';
		headers['Result'] = '*';

		const black_after =
			'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
		const black_clock: string | undefined = void 0;
		const black_color = 'b';
		const black_comment = null;
		const black_evaluation: number | undefined = void 0;
		const black_from = 'e7';
		const black_id = nanoid();
		const black_nags: NumericAnnotationGlyph[] = [];
		const black_promotion = 'q';
		const black_san = 'e5';
		const black_shapes: DrawShape[] = [];
		const black_to = 'e5';
		const black_left: NeoMove | null = null;
		const black_right: NeoMove | null = null;
		const black_node = new NeoMove(
			black_after,
			black_clock,
			black_color,
			black_comment,
			black_evaluation,
			black_from,
			black_id,
			black_nags,
			black_promotion,
			black_san,
			black_shapes,
			black_to,
			black_left,
			black_right,
		);

		const white_after =
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const white_clock: string | undefined = void 0;
		const white_color = 'w';
		const white_comment = null;
		const white_evaluation: number | undefined = void 0;
		const white_from = 'e2';
		const white_id = nanoid();
		const white_nags: NumericAnnotationGlyph[] = [];
		const white_promotion = 'q';
		const white_san = 'e4';
		const white_shapes: DrawShape[] = [];
		const white_to = 'e4';
		const white_left: NeoMove | null = black_node;
		const white_right: NeoMove | null = null;
		const white_node = new NeoMove(
			white_after,
			white_clock,
			white_color,
			white_comment,
			white_evaluation,
			white_from,
			white_id,
			white_nags,
			white_promotion,
			white_san,
			white_shapes,
			white_to,
			white_left,
			white_right,
		);

		const model = new NeoStudy(
			null,
			[],
			headers,
			white_node,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);

		const jgn: JgnStudy = jgn_from_neo(model);

		const pgn = jgn_to_pgn_string(jgn);

		expect(pgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 1... e5 *',
		);
	});
	test('1. e4 (1. d4) *', () => {
		const headers: Record<string, string> = {};
		headers['Event'] = '?';
		headers['Site'] = '?';
		headers['Date'] = '????.??.??';
		headers['Round'] = '?';
		headers['White'] = '?';
		headers['Black'] = '?';
		headers['Result'] = '*';

		const d4_after =
			'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
		const d4_clock: string | undefined = void 0;
		const d4_color = 'w';
		const d4_comment = null;
		const d4_evaluation: number | undefined = void 0;
		const d4_from = 'd2';
		const d4_id = nanoid();
		const d4_nags: NumericAnnotationGlyph[] = [];
		const d4_promotion = 'q';
		const d4_san = 'd4';
		const d4_shapes: DrawShape[] = [];
		const d4_to = 'd4';
		const d4_node = new NeoMove(
			d4_after,
			d4_clock,
			d4_color,
			d4_comment,
			d4_evaluation,
			d4_from,
			d4_id,
			d4_nags,
			d4_promotion,
			d4_san,
			d4_shapes,
			d4_to,
			null,
			null,
		);

		const e4_after = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const e4_clock: string | undefined = void 0;
		const e4_color = 'w';
		const e4_comment = null;
		const e4_evaluation: number | undefined = void 0;
		const e4_from = 'e2';
		const e4_id = nanoid();
		const e4_nags: NumericAnnotationGlyph[] = [];
		const e4_promotion = 'q';
		const e4_san = 'e4';
		const e4_shapes: DrawShape[] = [];
		const e4_to = 'e4';
		const e4_node = new NeoMove(
			e4_after,
			e4_clock,
			e4_color,
			e4_comment,
			e4_evaluation,
			e4_from,
			e4_id,
			e4_nags,
			e4_promotion,
			e4_san,
			e4_shapes,
			e4_to,
			null,
			d4_node,
		);

		const model = new NeoStudy(
			null,
			[],
			headers,
			e4_node,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const jgn: JgnStudy = jgn_from_neo(model);

		const pgn = jgn_to_pgn_string(jgn);

		expect(pgn).toBe(
			'[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 (1. d4) *',
		);
	});
});
