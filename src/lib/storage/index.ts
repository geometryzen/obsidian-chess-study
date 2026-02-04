import { JSONContent } from '@tiptap/react';
import { PieceSymbol } from 'chess.js';
import { DrawShape } from 'chessground/draw';

export const CURRENT_STORAGE_VERSION = '0.0.2';

/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface Variant {
	variantId: string;
	parentMoveId: string;
	moves: VariantMove[];
}

/**
 * The design of extending Move seems questionable to me.
 * FIXME: Extending Move is a coupling to chess.js
 */
export interface VariantMove /* extends Move*/ {
	moveId: string;
	shapes: DrawShape[];
	comment: JSONContent | null;
	san: string;
	after: string;
}

/**
 * The design of extending Move seems questionable to me.
 * This interface is part of the serialization structure and should not be changed.
 * FIXME: Extending Move couples to chess.js
 */
export interface ChessStudyMove /* extends Move*/ {
	moveId: string;
	// We really would like an array of arrays here in order to support multiple variations.
	variants: Variant[];
	shapes: DrawShape[];
	comment: JSONContent | null;
	color: 'w' | 'b';
	san: string;
	after: string;
	from: string;
	to: string;
	promotion: 'b' | 'p' | 'n' | 'r' | 'q' | 'k' | PieceSymbol | undefined; // temporary borrow from chess.js
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
