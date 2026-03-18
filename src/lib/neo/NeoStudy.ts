import { JSONContent } from '@tiptap/react';
import { NeoMove } from './NeoMove';
import { DrawShape } from 'chessground/draw';

/**
 * A version, headers, comment (top level), moves, and a rootFEN.
 * This interface defines the serialization structure and should not be changed.
 */
export class NeoStudy {
	/**
	 * The headers are obtained from chess.js, which does the parsing of PGN data.
	 */
	readonly headers: Record<string, string>;
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
	root: NeoMove | null;
	/**
	 * The starting position.
	 */
	readonly rootFEN: string;

	constructor(
		comment: JSONContent | null,
		shapes: DrawShape[],
		headers: Record<string, string>,
		root: NeoMove | null,
		rootFEN: string,
	) {
		this.comment = comment;
		((this.shapes = shapes), (this.headers = headers));
		this.root = root;
		this.rootFEN = rootFEN;
	}
}
