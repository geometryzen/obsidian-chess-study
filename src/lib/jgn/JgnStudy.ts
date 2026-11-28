import { JSONContent } from '@tiptap/react';
import { JgnMove } from './JgnMove';
import { DrawShape } from 'chessground/draw';

/**
 * A version, headers, comment (top level), moves, and a rootFEN.
 * This interface defines the serialization structure and should not be changed.
 */
export interface JgnStudy {
	/**
	 * The headers are obtained from chess.js, which does the parsing of PGN data.
	 */
	headers: Record<string, string>;
	/**
	 * The top-level comment.
	 */
	comment: JSONContent | null;
	/**
	 * The top-level shapes.
	 */
	shapes: DrawShape[];
	/**
	 * The moves that follow from the root FEN.
	 */
	moves: JgnMove[];
	/**
	 * The starting position.
	 */
	rootFEN: string;
}
