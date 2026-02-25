import { describe, expect, test } from '@jest/globals';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { NumericAnnotationGlyph } from '../lib/NumericAnnotationGlyphs';
import { ChessStudyFileContent } from '../lib/store/ChessStudyFileContent';
import { json_from_model } from '../lib/transform/json_from_model';
import { ChessStudyModel } from '../lib/tree/ChessStudyModel';
import { ChessStudyNode } from '../lib/tree/ChessStudyNode';

describe('json_from_model', () => {
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
		const json: ChessStudyFileContent = json_from_model(model, '3.1.4');
		/*
		const chessStudy: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};
		*/
		// const pgn = chess_study_to_pgn_string(chessStudy);

		expect(json.comment).toBe(model.comment);
		expect(json.headers).toBe(model.headers);
		expect(json.moves).toStrictEqual([]);
		expect(json.rootFEN).toBe(model.rootFEN);
		expect(json.version).toBe('3.1.4');
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
		const json: ChessStudyFileContent = json_from_model(model, '3.1.4');

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
		expect(json.version).toBe('3.1.4');
	});
});
