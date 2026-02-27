import { describe, expect, test } from '@jest/globals';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { NumericAnnotationGlyph } from '../lib/NumericAnnotationGlyphs';
import { JgnContent } from '../lib/jgn/JgnContent';
import { jgn_from_model } from '../lib/transform/jgn_from_model';
import { ChessStudyModel } from '../lib/tree/ChessStudyModel';
import { ChessStudyNode } from '../lib/tree/ChessStudyNode';

describe('jgn_from_model', () => {
	test('headers', () => {
		const headers: Record<string, string> = {};
		headers['Event'] = '?';
		headers['Site'] = '?';
		headers['Date'] = '????.??.??';
		headers['Round'] = '?';
		headers['White'] = '?';
		headers['Black'] = '?';
		headers['Result'] = '*';

		const model = new ChessStudyModel(
			null,
			headers,
			null,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const json: JgnContent = jgn_from_model(model);
		expect(json.comment).toBe(model.comment);
		expect(json.headers).toBe(model.headers);
		expect(json.moves).toStrictEqual([]);
		expect(json.rootFEN).toBe(model.rootFEN);
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
		const clock = '';
		const color = 'w';
		const comment = null;
		const evaluation = 0;
		const from = 'e2';
		const id = nanoid();
		const nags: NumericAnnotationGlyph[] = [];
		const promotion = 'q';
		const san = 'e4';
		const shapes: DrawShape[] = [];
		const to = 'e4';
		const left: ChessStudyNode | null = null;
		const right: ChessStudyNode | null = null;
		const root = new ChessStudyNode(
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

		const model = new ChessStudyModel(
			null,
			headers,
			root,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const json: JgnContent = jgn_from_model(model);

		expect(json.comment).toBe(model.comment);
		expect(json.headers).toBe(model.headers);
		expect(json.moves.length).toBe(1);
		const move = json.moves[0];
		expect(move.after).toBe(after);
		expect(move.clock).toBe(clock);
		expect(move.color).toBe(color);
		expect(move.comment).toBe(comment);
		expect(move.evaluation).toBe(evaluation);
		expect(move.from).toBe(from);
		expect(move.moveId).toBe(id);
		expect(move.nags).toBe(nags);
		expect(move.promotion).toBe(promotion);
		expect(move.san).toBe(san);
		expect(move.shapes).toBe(shapes);
		expect(move.to).toBe(to);
		expect(move.variants).toStrictEqual([]);
		expect(json.rootFEN).toBe(model.rootFEN);
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
		const black_clock = '';
		const black_color = 'b';
		const black_comment = null;
		const black_evaluation = 0;
		const black_from = 'e7';
		const black_id = nanoid();
		const black_nags: NumericAnnotationGlyph[] = [];
		const black_promotion = 'q';
		const black_san = 'e5';
		const black_shapes: DrawShape[] = [];
		const black_to = 'e5';
		const black_left: ChessStudyNode | null = null;
		const black_right: ChessStudyNode | null = null;
		const black_node = new ChessStudyNode(
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
		const white_clock = '';
		const white_color = 'w';
		const white_comment = null;
		const white_evaluation = 0;
		const white_from = 'e2';
		const white_id = nanoid();
		const white_nags: NumericAnnotationGlyph[] = [];
		const white_promotion = 'q';
		const white_san = 'e4';
		const white_shapes: DrawShape[] = [];
		const white_to = 'e4';
		const white_left: ChessStudyNode | null = black_node;
		const white_right: ChessStudyNode | null = null;
		const white_node = new ChessStudyNode(
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

		const model = new ChessStudyModel(
			null,
			headers,
			white_node,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const json: JgnContent = jgn_from_model(model);

		expect(json.comment).toBe(model.comment);
		expect(json.headers).toBe(model.headers);
		expect(json.moves.length).toBe(2);
		const m0 = json.moves[0];
		expect(m0.after).toBe(white_after);
		expect(m0.clock).toBe(white_clock);
		expect(m0.color).toBe(white_color);
		expect(m0.comment).toBe(white_comment);
		expect(m0.evaluation).toBe(white_evaluation);
		expect(m0.from).toBe(white_from);
		expect(m0.moveId).toBe(white_id);
		expect(m0.nags).toBe(white_nags);
		expect(m0.promotion).toBe(white_promotion);
		expect(m0.san).toBe(white_san);
		expect(m0.shapes).toBe(white_shapes);
		expect(m0.to).toBe(white_to);
		expect(m0.variants).toStrictEqual([]);
		const m1 = json.moves[1];
		expect(m1.after).toBe(black_after);
		expect(m1.clock).toBe(black_clock);
		expect(m1.color).toBe(black_color);
		expect(m1.comment).toBe(black_comment);
		expect(m1.evaluation).toBe(black_evaluation);
		expect(m1.from).toBe(black_from);
		expect(m1.moveId).toBe(black_id);
		expect(m1.nags).toBe(black_nags);
		expect(m1.promotion).toBe(black_promotion);
		expect(m1.san).toBe(black_san);
		expect(m1.shapes).toBe(black_shapes);
		expect(m1.to).toBe(black_to);
		expect(m1.variants).toStrictEqual([]);
		expect(json.rootFEN).toBe(model.rootFEN);
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
		const d4_clock = '';
		const d4_color = 'b';
		const d4_comment = null;
		const d4_evaluation = 0;
		const d4_from = 'e7';
		const d4_id = nanoid();
		const d4_nags: NumericAnnotationGlyph[] = [];
		const d4_promotion = 'q';
		const d4_san = 'e5';
		const d4_shapes: DrawShape[] = [];
		const d4_to = 'e5';
		const d4_node = new ChessStudyNode(
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
		const e4_clock = '';
		const e4_color = 'w';
		const e4_comment = null;
		const e4_evaluation = 0;
		const e4_from = 'e2';
		const e4_id = nanoid();
		const e4_nags: NumericAnnotationGlyph[] = [];
		const e4_promotion = 'q';
		const e4_san = 'e4';
		const e4_shapes: DrawShape[] = [];
		const e4_to = 'e4';
		const e4_node = new ChessStudyNode(
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

		const model = new ChessStudyModel(
			null,
			headers,
			e4_node,
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		);
		const jgn: JgnContent = jgn_from_model(model);

		expect(jgn.comment).toBe(model.comment);
		expect(jgn.headers).toBe(model.headers);
		expect(jgn.moves.length).toBe(1);
		const m0 = jgn.moves[0];
		expect(m0.after).toBe(e4_after);
		expect(m0.clock).toBe(e4_clock);
		expect(m0.color).toBe(e4_color);
		expect(m0.comment).toBe(e4_comment);
		expect(m0.evaluation).toBe(e4_evaluation);
		expect(m0.from).toBe(e4_from);
		expect(m0.moveId).toBe(e4_id);
		expect(m0.nags).toBe(e4_nags);
		expect(m0.promotion).toBe(e4_promotion);
		expect(m0.san).toBe(e4_san);
		expect(m0.shapes).toBe(e4_shapes);
		expect(m0.to).toBe(e4_to);
		expect(m0.variants.length).toBe(1);
		const variation = m0.variants[0];
		expect(variation.moves.length).toBe(1);
		/*
		const m1 = json.moves[1];
		expect(m1.after).toBe(black_after);
		expect(m1.clock).toBe(black_clock);
		expect(m1.color).toBe(black_color);
		expect(m1.comment).toBe(black_comment);
		expect(m1.evaluation).toBe(black_evaluation);
		expect(m1.from).toBe(black_from);
		expect(m1.moveId).toBe(black_id);
		expect(m1.nags).toBe(black_nags);
		expect(m1.promotion).toBe(black_promotion);
		expect(m1.san).toBe(black_san);
		expect(m1.shapes).toBe(black_shapes);
		expect(m1.to).toBe(black_to);
		expect(m1.variants).toStrictEqual([]);
		*/
		expect(jgn.rootFEN).toBe(model.rootFEN);
	});
});
