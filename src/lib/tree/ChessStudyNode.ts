import { JSONContent } from '@tiptap/react';
import { DrawShape } from 'chessground/draw';
import { NumericAnnotationGlyph } from '../NumericAnnotationGlyphs';

export class ChessStudyNode {
	readonly after: string;
	readonly clock: string | undefined;
	readonly color: 'w' | 'b';
	readonly comment: JSONContent | null;
	readonly evaluation: number | undefined;
	readonly from: string;
	readonly id: string;
	readonly nags: NumericAnnotationGlyph[];
	readonly promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined;
	readonly san: string;
	readonly shapes: DrawShape[];
	readonly to: string;
	/**
	 * The left leg of the tree is the next move.
	 */
	readonly left: ChessStudyNode | null;
	/**
	 * The right leg of the tree is the next variation.
	 */
	readonly right: ChessStudyNode | null;
	constructor(
		after: string,
		clock: string | undefined,
		color: 'w' | 'b',
		comment: JSONContent | null,
		evaluation: number | undefined,
		from: string,
		id: string,
		nags: NumericAnnotationGlyph[],
		promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined,
		san: string,
		shapes: DrawShape[],
		to: string,
		left: ChessStudyNode | null,
		right: ChessStudyNode | null,
	) {
		this.after = after;
		this.clock = clock;
		this.color = color;
		this.comment = comment;
		this.evaluation = evaluation;
		this.from = from;
		this.id = id;
		this.nags = nags;
		this.promotion = promotion;
		this.san = san;
		this.shapes = shapes;
		this.to = to;
		this.left = left;
		this.right = right;
	}
}
