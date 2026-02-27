import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { JgnContent } from '../lib/jgn/JgnContent';
import { JgnMove, JgnVariation } from '../lib/jgn/JgnMove';
import { model_from_jgn } from '../lib/transform/model_from_jgn';
import { ChessStudyNode } from '../lib/tree/ChessStudyNode';

describe('model_from_jgn', () => {
	test('headers', () => {
		const json: JgnContent = {
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

		const model = model_from_jgn(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).toBe(null);
		expect(model.rootFEN).toBe(json.rootFEN);
	});
	test('1. e4', () => {
		const move: JgnMove = {
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
		const json: JgnContent = {
			headers: {},
			comment: null,
			moves: [move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const model = model_from_jgn(json);

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
	});
	test('1. e4 e5', () => {
		const white_move: JgnMove = {
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
		const black_move: JgnMove = {
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
		const json: JgnContent = {
			headers: {},
			comment: null,
			moves: [white_move, black_move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const model = model_from_jgn(json);

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
	});
	test('1. e4 or 1. d4', () => {
		const e4_move: JgnMove = {
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
		const d4_move: JgnMove = {
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
		const variation: JgnVariation = {
			parentMoveId: e4_move.moveId,
			moves: [d4_move],
		};
		e4_move.variants.push(variation);
		const json: JgnContent = {
			headers: {},
			comment: null,
			moves: [e4_move, d4_move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const model = model_from_jgn(json);

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
	});
	test('1. e4 or 1. d4 or 1. c4', () => {
		const e4_move: JgnMove = {
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
		const d4_move: JgnMove = {
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
		const c4_move: JgnMove = {
			after: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1',
			color: 'w',
			comment: null,
			from: 'c2',
			moveId: nanoid(),
			nags: [],
			promotion: 'q',
			san: 'c4',
			shapes: [],
			to: 'c4',
			variants: [],
		};
		const d4_variation: JgnVariation = {
			parentMoveId: e4_move.moveId,
			moves: [d4_move],
		};
		const c4_variation: JgnVariation = {
			parentMoveId: e4_move.moveId,
			moves: [c4_move],
		};
		e4_move.variants.push(d4_variation);
		e4_move.variants.push(c4_variation);
		const json: JgnContent = {
			headers: {},
			comment: null,
			moves: [e4_move],
			rootFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		};

		const model = model_from_jgn(json);

		expect(model.comment).toBe(json.comment);
		expect(model.headers).toBe(json.headers);
		expect(model.root).not.toBe(null);

		const e4_node = model.root as ChessStudyNode;
		expect(e4_node.after).toBe(e4_move.after);
		expect(e4_node.clock).toBe(e4_move.clock);
		expect(e4_node.color).toBe(e4_move.color);
		expect(e4_node.comment).toBe(e4_move.comment);
		expect(e4_node.evaluation).toBe(e4_move.evaluation);
		expect(e4_node.from).toBe(e4_move.from);
		// Do we need to preseve the move identifier?
		expect(e4_node.id).toBe(e4_move.moveId);
		expect(e4_node.nags).toBe(e4_move.nags);
		expect(e4_node.promotion).toBe(e4_move.promotion);
		expect(e4_node.san).toBe(e4_move.san);
		expect(e4_node.shapes).toBe(e4_move.shapes);
		expect(e4_node.to).toBe(e4_move.to);

		expect(e4_node.left).toBe(null);
		expect(e4_node.right).not.toBe(null);
		const d4_node = e4_node.right as ChessStudyNode;
		expect(d4_node.after).toBe(d4_move.after);
		expect(d4_node.clock).toBe(d4_move.clock);
		expect(d4_node.color).toBe(d4_move.color);
		expect(d4_node.comment).toBe(d4_move.comment);
		expect(d4_node.evaluation).toBe(d4_move.evaluation);
		expect(d4_node.from).toBe(d4_move.from);
		// Do we need to preseve the move identifier?
		expect(d4_node.id).toBe(d4_move.moveId);
		expect(d4_node.nags).toBe(d4_move.nags);
		expect(d4_node.promotion).toBe(d4_move.promotion);
		expect(d4_node.san).toBe(d4_move.san);
		expect(d4_node.shapes).toBe(d4_move.shapes);
		expect(d4_node.to).toBe(d4_move.to);
		expect(d4_node.left).toBe(null);
		// The right of the d4_mode should be c4
		// TODO
		expect(d4_node.right).not.toBe(null);

		expect(model.rootFEN).toBe(json.rootFEN);
	});
});
