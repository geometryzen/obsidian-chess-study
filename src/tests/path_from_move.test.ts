import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { NeoMove } from '../lib/neo/NeoMove';
import { path_from_move } from '../lib/neo/path_from_move';

describe('path_from_move', () => {
	test('variations', () => {
		const e4_node = new NeoMove(
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
			'',
			'w',
			null,
			0,
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
		const c6_node = new NeoMove(
			'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			'',
			'b',
			null,
			0,
			'c7', // from
			nanoid(),
			[],
			'q',
			'c6', // san
			[],
			'e4', // to
			null,
			null,
		);
		const d4_node = new NeoMove(
			'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
			'',
			'w',
			null,
			0,
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
		e4_node.left = c6_node;
		c6_node.left = d4_node;
		const root = e4_node;

		const e4_path = path_from_move(root, e4_node);
		expect(e4_path.length).toBe(1);
		expect(e4_path[0]).toBe('e4');

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
