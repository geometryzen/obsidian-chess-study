import { JSONContent } from '@tiptap/react';
import { JgnMove } from './JgnMove';

/**
 * A version, headers, comment (top level), moves, and a rootFEN.
 * This interface defines the serialization structure and should not be changed.
 */
export interface JgnContent {
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
	moves: JgnMove[];
	/**
	 * The starting position.
	 */
	rootFEN: string;
}
