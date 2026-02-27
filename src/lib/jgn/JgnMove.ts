import { JSONContent } from '@tiptap/react';
import { DrawShape } from 'chessground/draw';
import { NumericAnnotationGlyph } from '../NumericAnnotationGlyphs';

/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface JgnVariation {
	/**
	 * The identifier of the Main Line move corresponding to this variation.
	 * This is not the prior move.
	 * It is the move containing this Variation in its variations list.
	 * It would be better if thisa was called the ownerMoveId?
	 */
	parentMoveId: string;
	moves: JgnMove[];
}

/**
 * This interface is part of the serialization structure and should not be changed.
 * FIXME: Extending Move couples to chess.js
 */
export interface JgnMove {
	moveId: string;
	variants: JgnVariation[];
	shapes: DrawShape[];
	comment: JSONContent | null;
	color: 'w' | 'b';
	san: string;
	after: string;
	from: string;
	to: string;
	promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | undefined;
	/**
	 * Numeric Annotation Glyphs
	 */
	nags: NumericAnnotationGlyph[];
	/**
	 *
	 */
	clock?: string;
	/**
	 *
	 */
	evaluation?: number;
}
