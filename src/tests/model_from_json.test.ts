import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { ChessStudyFileContent } from '../lib/store/ChessStudyFileContent';
import {
	ChessStudyFileMove,
	ChessStudyFileVariation,
} from '../lib/store/ChessStudyFileMove';
import { model_from_json } from '../lib/transform/model_from_json';
import { ChessStudyNode } from '../lib/tree/ChessStudyNode';

describe('model_from_json', () => {
	test('headers', () => {
		const json: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};
		json.headers['Event'] = '?';
		json.headers['Site'] = '?';
		json.headers['Date'] = '????.??.??';
		json.headers['Round'] = '?';
		json.headers['White'] = '?';
		json.headers['Black'] = '?';
		json.headers['Result'] = '*';

		const { model, version } = model_from_json(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).toBe(null);
		expect(model.rootFEN).toBe(json.rootFEN);
		expect(version).toBe(json.version);
	});
	test('1. e4', () => {
		const move: ChessStudyFileMove = {
			after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			color: 'w',
			comment: null,
			from: 'e2',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'e4',
			shapes: [],
			to: 'e4',
			variants: [],
		};
		const json: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const { model, version } = model_from_json(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).not.toBe(null);
		const root = model.root as ChessStudyNode;
		expect(root.after).toBe(move.after);
		expect(root.clock).toBe(move.clock);
		expect(root.color).toBe(move.color);
		expect(root.comment).toBe(move.comment);
		expect(root.evaluation).toBe(move.evaluation);
		expect(root.from).toBe(move.from);
		// Do we need to preseve the move identifier?
		expect(root.id).toBe(move.moveId);
		expect(root.nags).toBe(move.nags);
		expect(root.promotion).toBe(move.promotion);
		expect(root.san).toBe(move.san);
		expect(root.shapes).toBe(move.shapes);
		expect(root.to).toBe(move.to);
		expect(root.left).toBe(null);
		expect(root.right).toBe(null);

		expect(model.rootFEN).toBe(json.rootFEN);
		expect(version).toBe(json.version);
	});
	test('1. e4 e5', () => {
		const white_move: ChessStudyFileMove = {
			after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			color: 'w',
			comment: null,
			from: 'e2',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'e4',
			shapes: [],
			to: 'e4',
			variants: [],
		};
		const black_move: ChessStudyFileMove = {
			after: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			color: 'b',
			comment: null,
			from: 'e7',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'e5',
			shapes: [],
			to: 'e5',
			variants: [],
		};
		const json: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [white_move, black_move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const { model, version } = model_from_json(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).not.toBe(null);

		const root = model.root as ChessStudyNode;
		expect(root.after).toBe(white_move.after);
		expect(root.clock).toBe(white_move.clock);
		expect(root.color).toBe(white_move.color);
		expect(root.comment).toBe(white_move.comment);
		expect(root.evaluation).toBe(white_move.evaluation);
		expect(root.from).toBe(white_move.from);
		// Do we need to preseve the move identifier?
		expect(root.id).toBe(white_move.moveId);
		expect(root.nags).toBe(white_move.nags);
		expect(root.promotion).toBe(white_move.promotion);
		expect(root.san).toBe(white_move.san);
		expect(root.shapes).toBe(white_move.shapes);
		expect(root.to).toBe(white_move.to);

		expect(root.left).not.toBe(null);
		const left = root.left as ChessStudyNode;
		expect(left.after).toBe(black_move.after);
		expect(left.clock).toBe(black_move.clock);
		expect(left.color).toBe(black_move.color);
		expect(left.comment).toBe(black_move.comment);
		expect(left.evaluation).toBe(black_move.evaluation);
		expect(left.from).toBe(black_move.from);
		// Do we need to preseve the move identifier?
		expect(left.id).toBe(black_move.moveId);
		expect(left.nags).toBe(black_move.nags);
		expect(left.promotion).toBe(black_move.promotion);
		expect(left.san).toBe(black_move.san);
		expect(left.shapes).toBe(black_move.shapes);
		expect(left.to).toBe(black_move.to);
		expect(left.left).toBe(null);
		expect(root.right).toBe(null);

		expect(model.rootFEN).toBe(json.rootFEN);
		expect(version).toBe(json.version);
	});
	test('1. e4 or 1. e5', () => {
		const e4_move: ChessStudyFileMove = {
			after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			color: 'w',
			comment: null,
			from: 'e2',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'e4',
			shapes: [],
			to: 'e4',
			variants: [],
		};
		const d4_move: ChessStudyFileMove = {
			after: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
			color: 'w',
			comment: null,
			from: 'd2',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'd4',
			shapes: [],
			to: 'd4',
			variants: [],
		};
		const variation: ChessStudyFileVariation = {
			variantId: nanoid(),
			parentMoveId: e4_move.moveId,
			moves: [d4_move],
		};
		e4_move.variants.push(variation);
		const json: ChessStudyFileContent = {
			version: '',
			headers: {},
			comment: null,
			moves: [e4_move, d4_move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const { model, version } = model_from_json(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).not.toBe(null);

		const root = model.root as ChessStudyNode;
		expect(root.after).toBe(e4_move.after);
		expect(root.clock).toBe(e4_move.clock);
		expect(root.color).toBe(e4_move.color);
		expect(root.comment).toBe(e4_move.comment);
		expect(root.evaluation).toBe(e4_move.evaluation);
		expect(root.from).toBe(e4_move.from);
		// Do we need to preseve the move identifier?
		expect(root.id).toBe(e4_move.moveId);
		expect(root.nags).toBe(e4_move.nags);
		expect(root.promotion).toBe(e4_move.promotion);
		expect(root.san).toBe(e4_move.san);
		expect(root.shapes).toBe(e4_move.shapes);
		expect(root.to).toBe(e4_move.to);

		expect(root.left).not.toBe(null);
		expect(root.right).not.toBe(null);
		const right = root.right as ChessStudyNode;
		expect(right.after).toBe(d4_move.after);
		expect(right.clock).toBe(d4_move.clock);
		expect(right.color).toBe(d4_move.color);
		expect(right.comment).toBe(d4_move.comment);
		expect(right.evaluation).toBe(d4_move.evaluation);
		expect(right.from).toBe(d4_move.from);
		// Do we need to preseve the move identifier?
		expect(right.id).toBe(d4_move.moveId);
		expect(right.nags).toBe(d4_move.nags);
		expect(right.promotion).toBe(d4_move.promotion);
		expect(right.san).toBe(d4_move.san);
		expect(right.shapes).toBe(d4_move.shapes);
		expect(right.to).toBe(d4_move.to);
		expect(right.left).toBe(null);
		expect(right.right).toBe(null);

		expect(model.rootFEN).toBe(json.rootFEN);
		expect(version).toBe(json.version);
	});
});
