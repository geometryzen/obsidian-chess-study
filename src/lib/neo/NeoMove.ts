import { JSONContent } from '@tiptap/react';

export class NeoMove {
	readonly after: string;
	readonly clock: string | undefined;
	readonly color: 'w' | 'b';
	comment: JSONContent | null;
	readonly evaluation: number | undefined;
	readonly from: string;
	readonly moveId: string;
	nags: number[];
	readonly promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined;
	readonly san: string;
	shapes: unknown[];
	readonly to: string;
	/**
	 * The left leg of the tree is the next move.
	 */
	left: NeoMove | null;
	/**
	 * The right leg of the tree is the next variation.
	 */
	right: NeoMove | null;
	constructor(
		after: string,
		clock: string | undefined,
		color: 'w' | 'b',
		comment: JSONContent | null,
		evaluation: number | undefined,
		from: string,
		id: string,
		nags: number[],
		promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined,
		san: string,
		shapes: unknown[],
		to: string,
		left: NeoMove | null,
		right: NeoMove | null,
	) {
		this.after = after;
		this.clock = clock;
		this.color = color;
		this.comment = comment;
		this.evaluation = evaluation;
		this.from = from;
		this.moveId = id;
		this.nags = nags;
		this.promotion = promotion;
		this.san = san;
		this.shapes = shapes;
		this.to = to;
		this.left = left;
		this.right = right;
	}
}
