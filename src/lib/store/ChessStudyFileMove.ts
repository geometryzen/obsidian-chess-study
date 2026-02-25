import { JSONContent } from '@tiptap/react';
import { DrawShape } from 'chessground/draw';
import { NumericAnnotationGlyph } from '../NumericAnnotationGlyphs';

export const CURRENT_STORAGE_VERSION = '0.0.2';

/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface ChessStudyFileVariation {
	variantId: string;
	/**
	 * The identifier of the Main Line move corresponding to this variation.
	 * This is not the prior move.
	 * It is the move containing this Variation in its variations list.
	 * It would be better if thisa was called the ownerMoveId?
	 */
	parentMoveId: string;
	moves: ChessStudyFileMove[];
}

/**
 * The design of extending Move seems questionable to me.
 * This interface is part of the serialization structure and should not be changed.
 * FIXME: Extending Move couples to chess.js
 */
export interface ChessStudyFileMove /* extends Move*/ {
	moveId: string;
	variants: ChessStudyFileVariation[];
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
