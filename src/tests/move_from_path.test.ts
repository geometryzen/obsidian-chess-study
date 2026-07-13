import { describe, expect, test } from '@jest/globals';
import { nanoid } from 'nanoid';
import { NeoMove } from '../lib/neo/NeoMove';
import { moves_from_path } from '../lib/neo/move_from_path';

describe('move_from_path', () => {
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

		expect(moves_from_path(root, ['e4'])).toStrictEqual([e4_node]);
		expect(moves_from_path(root, ['e4', 'c6'])).toStrictEqual([e4_node, c6_node]);
		expect(moves_from_path(root, ['e4', 'c6', 'd4'])).toStrictEqual([
			e4_node,
			c6_node,
			d4_node,
		]);
		expect(moves_from_path(root, ['e4', 'c5'])).toStrictEqual([e4_node]);
	});
});
