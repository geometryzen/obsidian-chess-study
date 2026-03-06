import { nanoid } from 'nanoid';
import { NeoMove } from '../lib/neo/NeoMove';
import { dfsGeneratorRL } from '../lib/neo/dfsGeneratorRL';
import { get_variation_prev } from '../lib/neo/get_variation_prev';

describe('find_parent', () => {
	test('variations', () => {
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

		expect(get_variation_prev(null, e5_node)).toBeNull();
		expect(get_variation_prev(root, root)).toBeNull();
		expect(get_variation_prev(root, e5_node)).toBeNull();
		expect(get_variation_prev(root, d5_node)).toBe(e5_node);
		expect(get_variation_prev(root, d4_node)).toBe(e4_node);
		expect(get_variation_prev(root, Nf6_node)).toBeNull();
		expect(get_variation_prev(root, Nf3_node)).toBe(d4_node);
		expect(get_variation_prev(root, b6_node)).toBeNull();
	});
});
