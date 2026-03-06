import { nanoid } from 'nanoid';
import { NeoMove } from '../lib/neo/NeoMove';
import { dfsGeneratorRL } from '../lib/neo/dfsGeneratorRL';

describe('dfsGenerator', () => {
	test('1. e4', () => {
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

		const sans: string[] = [];
		const nodes = dfsGeneratorRL(e4_node);
		for (const node of nodes) {
			sans.push(node.san);
		}

		expect(sans.length).toBe(1);
		expect(sans[0]).toBe('e4');
	});
	test('1. e4 e5', () => {
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

		e4_node.left = e5_node;

		const sans: string[] = [];
		const nodes = dfsGeneratorRL(e4_node);
		for (const node of nodes) {
			sans.push(node.san);
		}

		expect(sans.length).toBe(2);
		expect(sans[0]).toBe('e4');
		expect(sans[1]).toBe('e5');
	});
	test('1. e4 (1. d4) *', () => {
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
		e4_node.right = d4_node;

		const sans: string[] = [];
		const nodes = dfsGeneratorRL(e4_node);
		for (const node of nodes) {
			sans.push(node.san);
		}

		expect(sans.length).toBe(2);
		expect(sans[0]).toBe('e4');
		expect(sans[1]).toBe('d4');
	});
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
		e4_node.right = d4_node;
		e4_node.left = e5_node;
		d4_node.left = Nf6_node;
		d4_node.right = Nf3_node;
		e5_node.right = d5_node;
		Nf3_node.left = b6_node;

		const sans: string[] = [];
		const nodes = dfsGeneratorRL(e4_node);
		for (const node of nodes) {
			sans.push(node.san);
		}

		expect(sans.length).toBe(7);
		expect(sans[0]).toBe('e4');
		expect(sans[1]).toBe('d4');
		expect(sans[2]).toBe('Nf3');
		expect(sans[3]).toBe('b6');
		expect(sans[4]).toBe('Nf6');
		expect(sans[5]).toBe('e5');
		expect(sans[6]).toBe('d5');
	});
});
