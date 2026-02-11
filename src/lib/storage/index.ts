import { JSONContent } from '@tiptap/react';
import { DrawShape } from 'chessground/draw';
import { NumericAnnotationGlyph } from '../NumericAnnotationGlyphs';

export const CURRENT_STORAGE_VERSION = '0.0.2';

/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface Variation {
	variantId: string;
	/**
	 * The identifier of the Main Line move corresponding to this variation.
	 * This is not the prior move.
	 * It is the move containing this Variation in its variations list.
	 */
	parentMoveId: string;
	moves: ChessStudyMove[];
}

/**
 * The design of extending Move seems questionable to me.
 * This interface is part of the serialization structure and should not be changed.
 * FIXME: Extending Move couples to chess.js
 */
export interface ChessStudyMove /* extends Move*/ {
	moveId: string;
	variants: Variation[];
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
}

/**
 * A version, headers, comment (top level), moves, and a rootFEN.
 * This interface defines the serialization structure and should not be changed.
 */
export interface ChessStudyFileContent {
	/**
	 * The version is not being used at present.
	 */
	version: string;
	/**
	 * The headers are obtained from chess.js, which does the parsing of PGN data.
	 */
	headers: Record<string, string>;
	/**
	 * The top-level comment.
	 */
	comment: JSONContent | null;
	/**
	 * The moves that follow from the root FEN.
	 */
	moves: ChessStudyMove[];
	/**
	 * The starting position.
	 */
	rootFEN: string;
}
