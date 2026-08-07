import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { NeoMove } from '../lib/neo/NeoMove';
import { dfsGeneratorRL } from '../lib/neo/dfsGeneratorRL';
import { get_prev_move } from '../lib/neo/get_prev_move';
import { path_from_move } from '../lib/neo/path_from_move';

describe('get_prev_move', () => {
	test('001', () => {
		const e4_node = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			'',
			'w',
			null,
			0,
			'e2',
			nanoid(),
			[],
			'q',
			'e4',
			[],
			'e4',
			null,
			null,
		);
		const d4_node = new NeoMove(
			'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'w',
			null,
			0,
			'd2',
			nanoid(),
			[],
			'q',
			'd4',
			[],
			'd4',
			null,
			null,
		);
		const Nf6_node = new NeoMove(
			'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2',
			'',
			'b',
			null,
			0,
			'g8',
			nanoid(),
			[],
			'q',
			'Nf6',
			[],
			'f6',
			null,
			null,
		);
		const Nf3_node = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
			'',
			'w',
			null,
			0,
			'g1',
			nanoid(),
			[],
			'q',
			'Nf3',
			[],
			'f3',
			null,
			null,
		);
		const e5_node = new NeoMove(
			'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'e7',
			nanoid(),
			[],
			'q',
			'e5',
			[],
			'e5',
			null,
			null,
		);
		const d5_node = new NeoMove(
			'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'd7',
			nanoid(),
			[],
			'q',
			'd5',
			[],
			'd5',
			null,
			null,
		);
		const b6_node = new NeoMove(
			'rnbqkbnr/p1pppppp/1p6/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'b7',
			nanoid(),
			[],
			'q',
			'b6',
			[],
			'b6',
			null,
			null,
		);
		const root = e4_node;
		root.right = d4_node;
		root.left = e5_node;
		d4_node.left = Nf6_node;
		d4_node.right = Nf3_node;
		e5_node.right = d5_node;
		Nf3_node.left = b6_node;

		const sans: string[] = [];
		const nodes = dfsGeneratorRL(root);
		for (const node of nodes) {
			sans.push(node.san);
		}

		expect(get_prev_move(null, e5_node)).toBeNull();
		expect(get_prev_move(root, root)).toBeNull();
		expect(get_prev_move(root, e5_node)).toBe(e4_node);
		expect(get_prev_move(root, d5_node)).toBe(e4_node);
		expect(get_prev_move(root, d4_node)).toBeNull();
		expect(get_prev_move(root, Nf6_node)).toBe(d4_node);
		expect(get_prev_move(root, Nf3_node)).toBeNull();
		expect(get_prev_move(root, b6_node)).toBe(Nf3_node);
	});
	test('002', () => {
		const e4_node = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			'',
			'w',
			null,
			0,
			'e2',
			nanoid(),
			[],
			'q',
			'e4',
			[],
			'e4',
			null,
			null,
		);
		const e6_node = new NeoMove(
			'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'e7',
			nanoid(),
			[],
			'q',
			'e6',
			[],
			'e6',
			null,
			null,
		);
		const c6_node = new NeoMove(
			'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'c7',
			nanoid(),
			[],
			'q',
			'c6',
			[],
			'c6',
			null,
			null,
		);
		const d4_node = new NeoMove(
			'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
			'',
			'w',
			null,
			0,
			'd2',
			nanoid(),
			[],
			'q',
			'd4',
			[],
			'd4',
			null,
			null,
		);
		const root = e4_node;

		e4_node.left = e6_node;
		e4_node.right = null;

		e6_node.left = null;
		e6_node.right = c6_node;

		c6_node.left = d4_node;
		c6_node.right = null;

		d4_node.left = null;
		d4_node.right = null;

		/*
		const sans: string[] = [];
		const nodes = dfsGeneratorRL(root);
		for (const node of nodes) {
			sans.push(node.san);
		}
		*/

		expect(get_prev_move(null, e4_node)).toBeNull();
		expect(get_prev_move(null, e6_node)).toBeNull();
		expect(get_prev_move(null, c6_node)).toBeNull();
		expect(get_prev_move(null, d4_node)).toBeNull();

		expect(get_prev_move(root, root)).toBeNull();
		expect(get_prev_move(root, e6_node)).toBe(e4_node);
		expect(get_prev_move(root, c6_node)).toBe(e4_node);
		expect(get_prev_move(root, d4_node)).toBe(c6_node);

		const e4_path = path_from_move(root, e4_node);
		expect(e4_path.length).toBe(1);
		expect(e4_path[0]).toBe('e4');

		const e6_path = path_from_move(root, e6_node);
		expect(e6_path.length).toBe(2);
		expect(e6_path[0]).toBe('e4');
		expect(e6_path[1]).toBe('e6');

		const c6_path = path_from_move(root, c6_node);
		expect(c6_path.length).toBe(2);
		expect(c6_path[0]).toBe('e4');
		expect(c6_path[1]).toBe('c6');

		const d4_path = path_from_move(root, d4_node);
		expect(d4_path.length).toBe(3);
		expect(d4_path[0]).toBe('e4');
		expect(d4_path[1]).toBe('c6');
		expect(d4_path[2]).toBe('d4');
	});
});
